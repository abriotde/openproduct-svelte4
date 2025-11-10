#!/usr/bin/env python3
"""
Script pour extraire les emails des producteurs depuis leurs sites web.

Ce script :
1. Récupère les producteurs sans email mais avec un site web fonctionnel
2. Visite chaque site web et cherche les pages contact/à propos
3. Extrait les emails trouvés
4. Génère un fichier SQL avec les requêtes UPDATE
5. Génère un rapport CSV avec les résultats

Usage:
	python3 extract_emails_from_websites.py [--limit N] [--dry-run]
"""

import os
import re
import sys
import time
import logging
import argparse
import csv
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse
from datetime import datetime

import psycopg
import requests
from bs4 import BeautifulSoup

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/openproduct_dev')
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
TIMEOUT = 10  # secondes
MAX_PAGES_PER_SITE = 5  # Nombre maximum de pages à visiter par site
DELAY_BETWEEN_REQUESTS = 1  # secondes entre chaque requête

# Configuration du logging
logging.basicConfig(
	level=logging.INFO,
	format='%(asctime)s - %(levelname)s - %(message)s',
	handlers=[
		logging.FileHandler('extract_emails.log'),
		logging.StreamHandler()
	]
)
logger = logging.getLogger(__name__)

# Patterns pour détecter les emails
EMAIL_PATTERN = re.compile(
	r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
)

# Emails à ignorer (génériques, spam, etc.)
IGNORED_EMAILS = {
	'example@example.com',
	'email@example.com',
	'contact@example.com',
	'info@example.com',
	'noreply@',
	'no-reply@',
	'mailer@',
	'postmaster@',
	'webmaster@',
	'admin@example',
	'test@test',
	'spam@',
	'abuse@',
}

# Domaines à ignorer (services techniques, analytics, etc.)
IGNORED_DOMAINS = {
	'sentry.io',
	'sentry.wixpress.com',
	'sentry-next.wixpress.com',
	'wixpress.com',
	'googletagmanager.com',
	'google-analytics.com',
	'facebook.com',
	'twitter.com',
	'linkedin.com',
	'instagram.com',
	'youtube.com',
	'pinterest.com',
}

# Mots-clés pour identifier les pages contact
CONTACT_KEYWORDS = [
	'contact', 'contactez', 'nous-contacter', 'contacto',
	'about', 'a-propos', 'apropos', 'qui-sommes-nous',
	'mentions-legales', 'legal', 'imprint',
	'equipe', 'team', 'notre-equipe'
]


class EmailExtractor:
	"""Classe pour extraire les emails depuis les sites web."""
	
	def __init__(self):
		self.session = requests.Session()
		self.session.headers.update({'User-Agent': USER_AGENT})
		self.visited_urls: Set[str] = set()
	
	def is_valid_email(self, email: str) -> bool:
		"""Vérifie si un email est valide et non générique."""
		email_lower = email.lower()
		
		# Ignorer les emails génériques
		for ignored in IGNORED_EMAILS:
			if ignored in email_lower:
				return False
		
		# Ignorer les domaines techniques
		domain = email_lower.split('@')[1] if '@' in email_lower else ''
		if domain in IGNORED_DOMAINS:
			return False
		
		# Ignorer les emails avec des caractères suspects (hash, UUID)
		if len(email) > 50 or any(c in email for c in ['@sentry', 'wixpress']):
			return False
		
		# Ignorer les emails avec des extensions d'images
		if email_lower.endswith(('.png', '.jpg', '.gif', '.svg', '.jpeg')):
			return False
		
		# Vérifier le format
		if not EMAIL_PATTERN.match(email):
			return False
		
		return True
	
	def extract_emails_from_text(self, text: str) -> Set[str]:
		"""Extrait tous les emails d'un texte."""
		emails = set()
		matches = EMAIL_PATTERN.findall(text)
		
		for email in matches:
			if self.is_valid_email(email):
				emails.add(email.lower())
		
		return emails
	
	def get_page_content(self, url: str) -> Optional[str]:
		"""Récupère le contenu HTML d'une page."""
		try:
			response = self.session.get(url, timeout=TIMEOUT, allow_redirects=True)
			response.raise_for_status()
			return response.text
		except requests.RequestException as e:
			logger.warning(f"Erreur lors de la récupération de {url}: {e}")
			return None
	
	def find_contact_pages(self, base_url: str, html: str) -> List[str]:
		"""Trouve les liens vers les pages contact/à propos."""
		contact_urls = []
		
		try:
			soup = BeautifulSoup(html, 'html.parser')
			
			# Chercher tous les liens
			for link in soup.find_all('a', href=True):
				href = link.get('href', '')
				text = link.get_text().lower()
				
				# Vérifier si le lien ou le texte contient des mots-clés
				is_contact = any(keyword in href.lower() or keyword in text 
							   for keyword in CONTACT_KEYWORDS)
				
				if is_contact:
					full_url = urljoin(base_url, href)
					
					# Vérifier que c'est le même domaine
					if urlparse(full_url).netloc == urlparse(base_url).netloc:
						if full_url not in self.visited_urls:
							contact_urls.append(full_url)
			
		except Exception as e:
			logger.warning(f"Erreur lors de l'analyse des liens de {base_url}: {e}")
		
		return contact_urls[:MAX_PAGES_PER_SITE]
	
	def find_social_links(self, html: str) -> Dict[str, str]:
		"""Trouve les liens vers les réseaux sociaux."""
		social_links = {}
		
		try:
			soup = BeautifulSoup(html, 'html.parser')
			
			patterns = {
				'facebook': r'facebook\.com/[^/\s"\']+',
				'instagram': r'instagram\.com/[^/\s"\']+',
				'linkedin': r'linkedin\.com/[^/\s"\']+',
				'twitter': r'twitter\.com/[^/\s"\']+',
			}
			
			html_text = str(soup)
			
			for platform, pattern in patterns.items():
				matches = re.findall(pattern, html_text, re.IGNORECASE)
				if matches:
					social_links[platform] = f"https://{matches[0]}"
		
		except Exception as e:
			logger.warning(f"Erreur lors de la recherche de liens sociaux: {e}")
		
		return social_links
	
	def has_contact_form(self, html: str) -> bool:
		"""Détecte la présence d'un formulaire de contact."""
		try:
			soup = BeautifulSoup(html, 'html.parser')
			forms = soup.find_all('form')
			
			for form in forms:
				form_text = form.get_text().lower()
				form_html = str(form).lower()
				
				# Chercher des indices de formulaire de contact
				contact_indicators = ['email', 'message', 'contact', 'nom', 'name']
				if any(indicator in form_text or indicator in form_html 
					  for indicator in contact_indicators):
					return True
			
			return False
		except Exception as e:
			logger.warning(f"Erreur lors de la détection de formulaire: {e}")
			return False
	
	def extract_from_website(self, website_url: str) -> Dict:
		"""Extrait les informations d'un site web."""
		result = {
			'emails': set(),
			'social_links': {},
			'has_contact_form': False,
			'pages_visited': 0,
			'error': None
		}
		
		self.visited_urls.clear()
		
		try:
			# Normaliser l'URL
			if not website_url.startswith(('http://', 'https://')):
				website_url = 'https://' + website_url
			
			# Visiter la page d'accueil
			logger.info(f"Visite de {website_url}")
			html = self.get_page_content(website_url)
			
			if not html:
				result['error'] = "HS"
				return result
			
			self.visited_urls.add(website_url)
			result['pages_visited'] += 1
			
			# Extraire les emails de la page d'accueil
			emails = self.extract_emails_from_text(html)
			result['emails'].update(emails)
			
			# Chercher les liens sociaux
			result['social_links'] = self.find_social_links(html)
			
			# Détecter un formulaire de contact
			result['has_contact_form'] = self.has_contact_form(html)
			
			# Trouver et visiter les pages contact
			contact_pages = self.find_contact_pages(website_url, html)
			
			for contact_url in contact_pages:
				if result['pages_visited'] >= MAX_PAGES_PER_SITE:
					break
				
				time.sleep(DELAY_BETWEEN_REQUESTS)
				
				logger.info(f"  Visite de la page contact: {contact_url}")
				contact_html = self.get_page_content(contact_url)
				
				if contact_html:
					self.visited_urls.add(contact_url)
					result['pages_visited'] += 1
					
					# Extraire les emails
					emails = self.extract_emails_from_text(contact_html)
					result['emails'].update(emails)
					
					# Vérifier s'il y a un formulaire
					if not result['has_contact_form']:
						result['has_contact_form'] = self.has_contact_form(contact_html)
		
		except Exception as e:
			logger.error(f"Erreur lors de l'extraction depuis {website_url}: {e}")
			result['error'] = str(e)
		
		return result


def get_producers_without_email(limit: Optional[int] = None) -> List[Dict]:
	"""Récupère les producteurs sans email depuis la base de données."""
	try:
		conn = psycopg.connect(DATABASE_URL)
		cursor = conn.cursor()
		
		query = """
			SELECT id, company_name, website_1, website_2, website_3
			FROM producers
			WHERE (email IS NULL OR email = '')
				AND website_1 IS NOT NULL
				AND website_status != 'ko'
				AND website_1 LIKE '%%'
			ORDER BY id
		"""
		
		if limit:
			query += f" LIMIT {limit}"
		
		cursor.execute(query)
		rows = cursor.fetchall()
		
		producers = []
		for row in rows:
			producers.append({
				'id': row[0],
				'company_name': row[1],
				'website_1': row[2],
				'website_2': row[3],
				'website_3': row[4]
			})
		
		cursor.close()
		conn.close()
		
		logger.info(f"Récupération de {len(producers)} producteurs sans email")
		return producers
	
	except Exception as e:
		logger.error(f"Erreur lors de la récupération des producteurs: {e}")
		return []




def generate_csv_report(results: List[Dict], output_file: str):
	"""Génère un rapport CSV avec tous les résultats."""
	with open(output_file, 'w', newline='', encoding='utf-8') as f:
		fieldnames = [
			'id', 'company_name', 'website', 'emails_found', 'email_list',
			'facebook', 'instagram', 'linkedin', 'twitter',
			'has_contact_form', 'pages_visited', 'error'
		]
		
		writer = csv.DictWriter(f, fieldnames=fieldnames)
		writer.writeheader()
		
		for result in results:
			row = {
				'id': result['id'],
				'company_name': result['company_name'],
				'website': result['website'],
				'emails_found': len(result['emails']),
				'email_list': ', '.join(result['emails']),
				'facebook': result['social_links'].get('facebook', ''),
				'instagram': result['social_links'].get('instagram', ''),
				'linkedin': result['social_links'].get('linkedin', ''),
				'twitter': result['social_links'].get('twitter', ''),
				'has_contact_form': 'Oui' if result['has_contact_form'] else 'Non',
				'pages_visited': result['pages_visited'],
				'error': result.get('error', '')
			}
			writer.writerow(row)
		
	logger.info(f"Rapport CSV généré: {output_file}")


def main():
	"""Fonction principale."""
	parser = argparse.ArgumentParser(
		description='Extrait les emails des producteurs depuis leurs sites web'
	)
	parser.add_argument(
		'--limit', '-l',
		type=int,
		help='Nombre maximum de producteurs à traiter'
	)
	parser.add_argument(
		'--dry-run',
		action='store_true',
		help='Mode test sans génération de fichiers SQL'
	)
	
	args = parser.parse_args()
	
	# Récupérer les producteurs
	producers = get_producers_without_email(args.limit)
	
	if not producers:
		logger.info("Aucun producteur à traiter")
		return
	
	# Extraire les emails
	extractor = EmailExtractor()
	results = []

	sql_file = f'extract_emails_from_websites.sql'
	with open(sql_file, 'w', encoding='utf-8') as f:
		f.write("-- Requêtes UPDATE pour ajouter les emails des producteurs\n")
		f.write(f"-- Généré le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
	
		for i, producer in enumerate(producers, 1):
			logger.info(f"\n[{i}/{len(producers)}] Traitement de: {producer['company_name']}")
			sql_update = f"-- Producer: {producer['company_name']} \nUpdate producers SET\n"
			sep = ""

			website=producer['website_1']
			extraction_result = extractor.extract_from_website(website)
			if extraction_result.get('error')=='HS':
				extraction_result = extractor.extract_from_website(producer['website_2'])
				if extraction_result.get('error')=='HS':
					extraction_result = extractor.extract_from_website(producer['website_3'])
					if extraction_result.get('error')!='HS':
						website = producer['website_3']
				else:
					website = producer['website_2']

			result = {
				'id': producer['id'],
				'company_name': producer['company_name'],
				'website': website,
				**extraction_result
			}
			results.append(result)
			error = extraction_result['error']
			if error=='HS':
				sql_update += sep+"  webbsite_status='ko'"
				sep = ",\n"
			else:
				if result['emails']:
					logger.info(f"  ✓ {len(result['emails'])} email(s) trouvé(s): {', '.join(result['emails'])}")
					email = list(result['emails'])[0]
					sql_update += sep+f"  email='{email}'"
					sep = ",\n"
				else:
					logger.info(f"  ✗ Aucun email trouvé")
				
				if result['social_links']:
					facebook = result['social_links'].get('facebook', '')
					if facebook!='':
						if producer['website_2'] is None:
							sql_update += sep+f"  website_2='{facebook}'"
							sep = ",\n"
						elif producer['website_3'] is None:
							sql_update += sep+f"  website_3='{facebook}'"
							sep = ",\n"
					logger.info(f"  📱 Réseaux sociaux: {', '.join(result['social_links'].keys())}")
				
				if result['has_contact_form']:
					logger.info(f"  📝 Formulaire de contact détecté")
				
				if sep!="":
					sql_update += f"\n  WHERE id={result['id']};\n\n"
					f.write(sql_update)

			# Pause entre chaque site
			if i < len(producers):
				time.sleep(DELAY_BETWEEN_REQUESTS)
	logger.info(f"Fichier SQL généré: {sql_file}")
	
	# Générer les rapports
	timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
	
	# csv_file = f'extract_emails_from_websites.csv'
	# generate_csv_report(results, csv_file)
	
	# Statistiques finales
	total = len(results)
	with_email = sum(1 for r in results if r['emails'])
	with_social = sum(1 for r in results if r['social_links'])
	with_form = sum(1 for r in results if r['has_contact_form'])
	with_error = sum(1 for r in results if r.get('error'))
	
	logger.info(f"\n{'='*60}")
	logger.info(f"STATISTIQUES FINALES")
	logger.info(f"{'='*60}")
	logger.info(f"Total de producteurs traités: {total}")
	logger.info(f"Emails trouvés: {with_email} ({with_email/total*100:.1f}%)")
	logger.info(f"Réseaux sociaux trouvés: {with_social} ({with_social/total*100:.1f}%)")
	logger.info(f"Formulaires de contact: {with_form} ({with_form/total*100:.1f}%)")
	logger.info(f"Erreurs: {with_error} ({with_error/total*100:.1f}%)")
	logger.info(f"{'='*60}")


if __name__ == '__main__':
	main()

