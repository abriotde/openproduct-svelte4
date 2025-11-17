
mutable struct Tag
	id::Integer
	name::String
	label::String
	description::String
	producers::Array{Integer}
end

producers_tag::Array{Tag} = []
push!(producers_tag, Tag(0, "PME", "Petites et Moyennes Entreprises", "Entreprises de petite et moyenne taille", []))
push!(producers_tag, Tag(1, "AB", "Agriculture Biologique", "Producteurs certifiés agriculture biologique ou assimilés", []))
push!(producers_tag, Tag(2, "OpenProduct", "Membre OpenProduct", "Producteur membre de l'asssociation OpenProduct", []))

function convert_tag_to_list(tag::Integer)::Vector{Tag}
	tag_lst = []
	if tag>0
		for t in producers_tag
			if tag & (2^t.id)>0
				push!(tag_lst, t)
			end
		end
	end
	tag_lst
end

#==

==#
products_by_id = missing
function loadProducts(dbConnection, used::Bool=true)::Dict{Integer, String}
	products = Dict()
	sql="select id, name from products"
	if (used)
		sql2="SELECT update_products_used();"
		pdcts = DBInterface.execute(dbConnection, sql2)

		sql *= " where used =True;"
	end
	pdcts = DBInterface.execute(dbConnection, sql)
	for product in pdcts
		products[product[1]] = product[2]
	end
	# println(products)
	products
end

function convert_product_ids_to_list(production::Union{Missing, String}, dbConnection)::Vector{String}
	if ismissing(products_by_id)
		global products_by_id
		products_by_id = loadProducts(dbConnection, true)
	end
	production_lst = []
	if !ismissing(production)
		for product_id in split(production, ",")
			product = products_by_id[parse(Int, product_id)]
			push!(production_lst, product)
		end
		# println(" - Production: ", production_lst)
	end
	production_lst
end