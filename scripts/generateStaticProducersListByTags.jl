#!/bin/env julia
#=
# Script to generate JSON list of producer's id by product's id. It allow a quick filter by product on /map.
# 
=#

import JSON, DBInterface, CSV, FunSQL, LibPQ
using Tables

include("connect.jl")
cnx = get_connection()
include("tag.jl")

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

sql = "SELECT id, tag FROM producers where tag>0"
rows = DBInterface.execute(cnx, sql)
for row in rows
	id_producer, tag = row
	global producers_tag
	for t in convert_tag_to_list(tag)
		push!(producers_tag[t.id+1].producers, id_producer)
	end
end
nb = write_tags(producers_tag)
DBInterface.close!(cnx)
exit(0)

# Write output

