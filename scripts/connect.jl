import DBInterface, LibPQ
using TOML

function get_connection(root_path::String="..")
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
	cnx = DBInterface.connect(LibPQ.Connection, connstr)
	println("Connected")
	return cnx
end
