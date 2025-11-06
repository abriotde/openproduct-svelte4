#!/bin/env julia
#=
# Script to generate JSON list of producer's id by product's id. It allow a quick filter by product on /map.
# 
=#

import JSON, DBInterface, CSV, FunSQL, LibPQ
using Tables

include("connect.jl")
cnx = get_connection()

mutable struct Tag
	id::Integer
	name::String
	label::String
	description::String
	producers::Array{Integer}
end

producers_tag::Array{Tag} = []
push!(producers_tag, Tag(1, "PME", "Petites et Moyennes Entreprises", "Entreprises de petite et moyenne taille", []))
push!(producers_tag, Tag(2, "AB", "Agriculture Biologique", "Producteurs certifiés agriculture biologique ou assimilés", []))

function write_tags(producers_tag::Array{Tag})
	nb = 0
	filepath = "../static/data/tags/t1.json"
	file = open(filepath, "w") do file
		write(file, JSON.json(producers_tag))
		nb += 1
		# println(filepath, "writen")
	end
	println("File ",filepath," updated.")
	nb
end

# Get min/max points

sql = "SELECT id, tag FROM producers"
rows = DBInterface.execute(cnx, sql)
for row in rows
	id_producer, tag = row
	mytag=1
	while tag>0
		if tag%2==1
			push!(producers_tag[mytag].producers, id_producer)
			tag -= 1
		end
		tag = tag/2
		mytag += 1
	end
end
nb = write_tags(producers_tag)
DBInterface.close!(cnx)
exit(0)

# Write output

