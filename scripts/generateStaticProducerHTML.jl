#!/bin/env julia
#=
# Script to generate HTML producer page used to get details from /map pins : static/data/producers/producer_[ID].html.
# 
=#

import JSON, OteraEngine, Dates, DBInterface
DEBUG=true

include("connect.jl")
dbConnection = get_connection()

TemplateProducerPage = missing

function generateStaticProducerPage(filepath::String, producer::LibPQ.Row, col_names::Vector{String})
	# println("generateStaticProducerPage(",filepath,",",producer,")")
	if ismissing(TemplateProducerPage)
		global TemplateProducerPage = OteraEngine.Template("./templateProducerPage.html")
	end
	file = open(filepath, "w") do file
		dictionary = Dict{Symbol, String}(
			Symbol(name) => string(producer[index]) for (index, name) in enumerate(col_names)
		)
		write(file, TemplateProducerPage(init=dictionary))
	end
end
function generateStaticProducerPages(webrootpath::String, webpath::String; useCache=false)
	if DEBUG; println("generateStaticProducerPages(",webrootpath,",",webpath,")"); end
	mindate = "2000-01-01 00:00:00"
	sql = "Select case when updated_at>='"*mindate*"' then 0 else 1 end ok, id, latitude lat, longitude lng, company_name as name,
			COALESCE(description, short_description) as text,
			short_description as job,
			concat(address,' ',post_code,' ',city) as address,
			phone_number_1, phone_number_2,
			case when send_email is NULL or send_email!='ko' then email else '' end as email,
			case when website_status in ('ok','400') then website_1 else '' end as website, siret_number as siret
		FROM producers
		WHERE latitude is not null AND longitude is not null
			AND status in ('actif','unknown','to-check')
		ORDER BY company_name;"
	if DEBUG
		println("SQL:",sql)
	end
	producers = DBInterface.execute(dbConnection, sql)
	weburl = webpath*"/producer_%d.html"
	nb::Int = 0
	nbDone::Int = 0
	producers2 = Dict{Int, String}()
	okCol = LibPQ.column_number(producers, :ok)
	idCol = LibPQ.column_number(producers, :id)
	nameCol = LibPQ.column_number(producers, :name)
	col_names = LibPQ.column_names(producers)
	for producer in producers
		if producer[okCol]==0
			producerFilepath = webrootpath*replace(weburl, "%d"=>string(producer[idCol]))
			generateStaticProducerPage(producerFilepath, producer, col_names)
			nbDone += 1
			if nbDone%1000==0
				print(".")
			end
		end
		# println(" File '"*producerFilepath*"' writed.")
		producers2[producer[idCol]] = producer[nameCol]
		nb += 1
	end
	filepath = webrootpath*webpath*"/index.html"
	page = OteraEngine.Template("./templateProducerDirectory.html")
	file = open(filepath, "w") do file
		write(file, page(init=Dict(
			Symbol("producers")=>producers2,
			Symbol("weburl")=>webpath
		)))
	end
	println(string(nb)*" producers in file '"*filepath*"' writed (",string(nbDone),").")
end

generateStaticProducerPages("../static","/producers", useCache=true)

