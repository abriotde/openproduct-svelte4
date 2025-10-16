
import DBInterface, LibPQ
using TOML

function get_connection()
	conffile = "../.env.local"
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
