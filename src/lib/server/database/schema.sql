-- ============================================
-- STRUCTURE BASE DE DONNÉES POSTGRESQL
-- ============================================

CREATE EXTENSION IF NOT EXISTS citext;

-- Table des produits
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name public.citext NOT NULL,
    description TEXT,
    is_collection BOOLEAN DEFAULT FALSE,
    hierarchy_level INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT products_unique UNIQUE (name)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_products_name ON products USING GIN (to_tsvector('french', name));
CREATE INDEX idx_products_hierarchy_level ON products(hierarchy_level);
CREATE INDEX idx_products_is_collection ON products(is_collection);

-- Table des relations parent-enfant
CREATE TABLE product_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INT NOT NULL,
    child_id INT NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'variant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (parent_id, child_id),
    CHECK (parent_id != child_id)
);

CREATE INDEX idx_relationships_parent ON product_relationships(parent_id);
CREATE INDEX idx_relationships_child ON product_relationships(child_id);


-- ============================================
-- FONCTIONS POSTGRESQL
-- ============================================

-- Fonction pour vérifier s'il existe un chemin entre deux produits
CREATE OR REPLACE FUNCTION check_path_exists(from_id INT, to_id INT)
RETURNS BOOLEAN AS $$
DECLARE
    path_count INT;
BEGIN
    WITH RECURSIVE path AS (
        SELECT child_id as node
        FROM product_relationships
        WHERE parent_id = from_id
        
        UNION
        
        SELECT pr.child_id
        FROM product_relationships pr
        INNER JOIN path p ON pr.parent_id = p.node
    )
    SELECT COUNT(*) INTO path_count FROM path WHERE node = to_id;
    
    RETURN path_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir tous les descendants d'un produit
CREATE OR REPLACE FUNCTION public.get_all_descendants(product_id integer)
 RETURNS TABLE(descendant_id integer, name public.citext, depth integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
	RETURN QUERY
    WITH RECURSIVE descendants AS (
        SELECT child_id as desc_product_id, 1 as deep
        FROM product_relationships
        WHERE parent_id = product_id
        UNION ALL
        SELECT pr.child_id, d.deep + 1
        FROM product_relationships pr
        INNER JOIN descendants d ON pr.parent_id = d.desc_product_id
        WHERE pr.child_id != product_id
    )
    SELECT desc_product_id, p.name, MIN(deep) as depth 
    FROM descendants d
    inner join products p on p.id =d.desc_product_id
    GROUP BY desc_product_id, p.name
    ORDER BY depth, p.name;
END;
$function$
;

-- Fonction pour obtenir tous les ancêtres d'un produit
CREATE OR REPLACE FUNCTION public.get_all_ancestors(product_id integer)
 RETURNS TABLE(ancestor_id integer, name citext, depth integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH RECURSIVE ancestors AS (
        SELECT parent_id as asc_product_id, 1 as depth
        FROM product_relationships
        WHERE child_id = product_id
        
        UNION ALL
        
        SELECT pr.parent_id, a.depth + 1
        FROM product_relationships pr
        INNER JOIN ancestors a ON pr.child_id = a.asc_product_id
    )
    SELECT DISTINCT a.asc_product_id as ancestor_id, p.name, MIN(a.depth) as depth 
    FROM ancestors a
    inner join products p on p.id =a.asc_product_id
    GROUP BY ancestor_id, p.name
    ORDER BY depth, ancestor_id;
END;
$function$
;

-- Trigger pour vérifier la hiérarchie avant insertion
CREATE OR REPLACE FUNCTION check_hierarchy_before_insert()
RETURNS TRIGGER AS $$
DECLARE
    parent_level INT;
    child_level INT;
BEGIN
    -- Récupérer les niveaux hiérarchiques
    SELECT hierarchy_level INTO parent_level FROM products WHERE id = NEW.parent_id;
    SELECT hierarchy_level INTO child_level FROM products WHERE id = NEW.child_id;
    
    -- Vérifier que le niveau de l'enfant est supérieur au parent
    IF child_level <= parent_level THEN
        RAISE EXCEPTION 'Le niveau hiérarchique de l''enfant (%) doit être supérieur au parent (%)', 
            child_level, parent_level;
    END IF;
    
    -- Vérifier qu'il n'y a pas de cycle
    IF check_path_exists(NEW.child_id, NEW.parent_id) THEN
        RAISE EXCEPTION 'Cycle détecté : le produit % est déjà un ancêtre de %', 
            NEW.child_id, NEW.parent_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_hierarchy
BEFORE INSERT ON product_relationships
FOR EACH ROW
EXECUTE FUNCTION check_hierarchy_before_insert();

-- Fonction de recherche avec sous-produits
CREATE OR REPLACE FUNCTION search_products_with_children(search_term VARCHAR)
RETURNS TABLE(
    id INT,
    name VARCHAR,
    description TEXT,
    is_collection BOOLEAN,
    hierarchy_level INT,
    price DECIMAL,
    is_direct_match BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH matching_products AS (
        SELECT p.id
        FROM products p
        WHERE p.name ILIKE '%' || search_term || '%'
    )
    SELECT DISTINCT
        p.id,
        p.name,
        p.description,
        p.is_collection,
        p.hierarchy_level,
        p.price,
        CASE WHEN p.id IN (SELECT id FROM matching_products) THEN TRUE ELSE FALSE END as is_direct_match
    FROM products p
    WHERE p.id IN (SELECT id FROM matching_products)
       OR p.id IN (
           SELECT descendant_id 
           FROM matching_products mp
           CROSS JOIN LATERAL get_all_descendants(mp.id)
       )
    ORDER BY is_direct_match DESC, p.hierarchy_level, p.name;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.producers_products (
	product_id int4 NULL,
	producer_id int4 NULL,
	CONSTRAINT producers_products_unique UNIQUE (product_id, producer_id),
	CONSTRAINT "porduct_id_FK" FOREIGN KEY (product_id) REFERENCES public.products(id),
	CONSTRAINT producer_id_fk FOREIGN KEY (producer_id) REFERENCES public.producers(id)
);

