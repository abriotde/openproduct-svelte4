import DBInterface, LibPQ
using TOML
using Memoization
using .OpenProduct

ROOT_PATH = ".."
DB_CONNECTION = missing
function get_connection(root_path::String="..")
	global ROOT_PATH = root_path
	global DB_CONNECTION
	if ismissing(DB_CONNECTION)
		# println("get_connection()", pwd())
		conffile = root_path*"/.env.local"
		if ! isfile(conffile)
			conffile = root_path*"/.env.production"
		end
		println("Use configuration file : ", conffile)
		conf = TOML.parsefile(conffile)
		DATABASE_NAME = conf["DATABASE_NAME"]
		DATABASE_USER = conf["DATABASE_USER"]
		DATABASE_PASSWORD = conf["DATABASE_PASSWORD"]
		connstr = "host=localhost port=5432 dbname=$DATABASE_NAME user=$DATABASE_USER password=$DATABASE_PASSWORD";
		# cnx = LibPQ.Connection(connstr)
		DB_CONNECTION = DBInterface.connect(LibPQ.Connection, connstr)
		println("Connected")
	end
	println("GetConnection => DB_CONNECTION")
	return DB_CONNECTION
end
OpenProduct.GetConnection() = get_connection(ROOT_PATH)
