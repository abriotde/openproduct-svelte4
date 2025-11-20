import DBInterface, LibPQ
using TOML
using Memoization

ENV=""
conffile = "../.env.local"
if isfile(conffile)
	println("Development environment")
	ENV="dev"
else
	println("Production environment")
	ENV="prod"
end

CURDIR=pwd()
ROOT_PATH = ".."
if ENV=="dev"
	ROOT_PATH = "../../openproduct-web-svelte4"
end

include(ROOT_PATH*"/../OpenProduct.jl/src/OpenProduct.jl")
using .OpenProduct
