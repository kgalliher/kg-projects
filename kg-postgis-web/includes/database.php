<?php
require_once("config.php");

class PGDatabase {
	
	private $connection;
	
	function __construct(){

		$this->open_connection();
	}
	
	public function get_connection(){
		return $this->connection;
	}
	
	public function open_connection(){
		$this->connection = pg_connect("host=".DB_SERVER . " port=".DB_PORT . " dbname=" . DB_NAME . " user=" . DB_USER . " password=" . DB_PASS);
		if (!$this->connection) {
			die("Database connection failed: " . pg_errormessage());
		}
	}
	
	public function close_connection(){
		if(isset($this->connection)) {
			pg_close($this->connection); 
			unset($this->connection);
		}
	}
	
	public function query($sql){
		$result = pg_query($this->connection, $sql);
		$this->confirm_query($result);
		return $result;
	}
	
	public function query_params($sql, $params=array()){
		if(!empty($params)){
			$result_set = pg_query_params($this->connection, $sql, $params);
			$this->confirm_query($result_set);
			return $result_set;
		}
		else {
			$result_set = $this->query($sql);
			return $result_set;
		}
	}
	
	private function confirm_query($result_set) {
		if (!$result_set) {
			die("Database query failed: " . pg_errormessage());
		}
	}
	
	public function escape_value( $value ) {
		$magic_quotes_active = get_magic_quotes_gpc();
		$new_enough_php = function_exists( "pg_escape_string" ); // i.e. PHP >= v4.3.0
		if( $new_enough_php ) { // PHP v4.3.0 or higher
			// undo any magic quote effects so mysql_real_escape_string can do the work
			if( $magic_quotes_active ) { $value = stripslashes( $value ); }
			$value = pg_escape_string( $value );
		} else { 
			// if magic quotes aren't already on then add slashes manually
			if( !$magic_quotes_active ) { $value = addslashes( $value ); }
			// if magic quotes are active, then the slashes already exist
		}
		return $value;
	}
    public static function find_all($table_name){
		global $database;
		$result_set = self::find_by_sql("SELECT * FROM cacounties");
		return $result_set;
	}
	
	public static function find_by_id($name="Riverside"){
		global $database;
		$result_set = self::find_by_sql("SELECT * FROM cacounties WHERE name = '${name}' LIMIT 1");
		$counties = $database->fetch_array($result_set);
		return $counties;
	}
	
	public static function find_column_values($table_name, $column){
		global $database;
		$values = array();
		$result_set = self::find_by_sql("SELECT {$column} FROM {$table_name}");
		while($row = $database->fetch_array($result_set)){
			array_push($values, $row[$column]);
		}
		return $values;
	}
	
	public static function find_by_sql($sql=""){
		global $database;
		$result_set = $database->query($sql);
		return $result_set;
	}

	public static function find_all_column_values($sql, $idx){
		global $database;
		$get_cols = self::find_by_sql($sql);
		$column_arr = pg_fetch_all_columns($get_cols, $idx);
		return $column_arr;
	}
	
	public static function get_shape_column($table_name, $schema_name){
		global $database;
		$geom_type = self::find_by_sql("select column_name from information_schema.columns where udt_name = 'geometry' and table_name = '{$table_name}' and table_schema = '{$schema_name}'");
		$geom_col = $database->fetch_array($geom_type);
		return $geom_col;
	}
	
	public static function get_geom_table_info(){
		global $database;
		$values = array();
		$geom_type = self::find_by_sql("select c.table_name, g.f_geometry_column from information_schema.tables c
										INNER JOIN  public.geometry_columns g
										ON c.table_name = g.f_table_name");
		while($row = $database->fetch_array($geom_type)){
			$values[$row['table_name']] = $row['f_geometry_column'];
		}
		return $values;
	}
	
	public static function layer_url(){
		global $database;
		$layers = array();
		$layer_record = self::find_by_sql("select table_name, column_name from information_schema.columns where udt_name = 'geometry' and table_schema = '" . DB_USER . "'");
		while($row = $database->fetch_array($layer_record)){
			$url = "geoprocessing/postgis.php?geotable={$row['table_name']}&geomfield={$row['column_name']}";
			$layers[$row[0]] = "geoprocessing/postgis.php?geotable={$row[0]}&geomfield={$row[1]}";
		}
		return $layers;
	}

	public static function get_pg_version(){
		global $database;
		$sql = "SELECT postgis_full_version() as pgfull";
		$pg_version = pg_version($database->get_connection());
		$pgis = $database->query($sql);
		$row = $database->fetch_assoc($pgis);
		$fv = $row['pgfull'];
		$postgis_version = substr($fv, 0, 22);
		$html = "<table class='table table-striped'><caption><strong>Postgres/PostGIS Version</strong></caption><th>PostgreSQL Version</th><th>PostGIS Version</th>";
		$html .= "<tr><td>{$pg_version['client']}</td><td>{$postgis_version}</td></tr></table>";
		return $html;
	}
	
	public function fetch_array($result_set){
		return pg_fetch_array($result_set);
	}
	
	public function fetch_assoc($result_set){
		return pg_fetch_assoc($result_set);
	}
	
	public function num_rows($result_set){
		return pg_numrows($result_set);
	}
	
	public function insert_id(){
		return pg_last_oid($this->connection);
	}
	
	public function affected_rows(){
		return pg_affected_rows($this->connection);
	}
}

$database = new PGDatabase();


?>