<?php
error_reporting(0);
class Database{
    const USERNAME="billybob";
    const PASSWORD="billybob";
    const HOST="localhost";
    const DB="sdeinterceptor";
    
    public function __construct(){
        $this->username = self::USERNAME;
        $this->password = self::PASSWORD;
        $this->host = self::HOST;
        $this->db = self::DB;
        $this->conn = new PDO("pgsql:dbname=$this->db;host=$this->host;port=5433", $this->username, $this->password);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    public function fetchOneRow($sql){
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch();
        return $result;
    }

    public function executeStmt($sql){
        try {
            $this->conn->exec($sql);
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }

    public function fetchAllRows($sql){
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
        }
    }

    public function executePreparedStmt($sql, $params){
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
    
    public function dropTable($table_name){
        $sql = "DROP TABLE {$table_name}";
        self::executeStmt($sql);
    }

    public function createTopTable($top_table){
        $sql = "create table {$top_table} (id serial, descriptor varchar(30), line text);";
        self::executeStmt($sql);
    }

    public function createComTable($com_table){
        $sql = "create table {$com_table} (line_num bigint, line_id bigint, stamp time, command_time varchar(25), command text);";
        self::fetchAllRows($sql);
    }
    
    public function createInfTable($inf_table){
        $sql = "create table {$inf_table} (line_num bigint, line_id bigint, stamp time, command_time varchar(25), command text);";
        self::fetchAllRows($sql);
    }
    
    public function deleteTraces($trace_name, $id){
        $table_names = array("top_" . $trace_name, "com_" . $trace_name, "inf_" . $trace_name);
        $delete_from_storage_sql = "delete from trace_storage where trace_name = '{$trace_name}' and id = {$id}";
        self::executeStmt($delete_from_storage_sql);
        foreach($table_names as $table){
            self::dropTable($table);
        }
    }
        
    public function checkTableExists($table_name){
        // if the table doesn't exist it will throw an exception and return false;
        try {
            $result = self::fetchOneRow("SELECT 1 FROM {$table_name} LIMIT 1");
        }
        catch(Exception $ex){
            return false;
        }
        return $result !== false;
    }
    
    public function insertTop($table_name, $params){
        $sql = "INSERT INTO {$table_name} (descriptor, line)";
        $sql .= " VALUES (?, ?)";
        self::executePreparedStmt($sql, $params);
    }
    
    public function insertComInf($table_name, $params){
        $sql = "INSERT INTO {$table_name} (line_num, line_id, stamp, command_time, command)";
        $sql .= " VALUES ('{$params[0]}', '{$params[1]}', '{$params[2]}', '{$params[3]}', '{$params[4]}')";
        self::executeStmt($sql);
    }
    
    public function insertTraceProperties($params){
        $sql = "INSERT INTO trace_storage (empno, incno, trcno, trace_name, file_name, stamp, description) ";
        $sql .= "VALUES (?, ?, ?, ?, ?, ?, ?)";
        self::executePreparedStmt($sql, $params);
    }

    public function createComInfIndex($table_name){
        $index = "CREATE INDEX {$table_name}_idx ON {$table_name} (line_id)";
        self::executeStmt($index);
    }
    
    public function retrieveLineCount($table_name){
        $sql = "select max(line_num) as max_line_count from inf_{$table_name}";
        return self::fetchOneRow($sql);
    }
    
    public function retrieveConfInf($table_name){
        $sql = "select a.line_num as cnum, b.line_num as inum, a.command as ccmd, b.command as icmd, a.command_time as ctime, b.command_time as itime
                from com_{$table_name} a
                left outer join inf_{$table_name} b
                on a.line_id = b.line_id;";

                return self::fetchAllRows($sql);
    }
    public function retrieveCommands($table_name){
        $sql = "SELECT DISTINCT(command) as command, command_time, line_num, line_id FROM com_{$table_name} order by line_num";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveInfo($table_name, $line_num){
        $sql = "SELECT line_id, line_num, command, command_time FROM inf_{$table_name}";
        $sql .= " WHERE line_id = {$line_num} order by line_num";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveCommandsByFilter($table_name, $start, $end){
        $sql = "SELECT DISTINCT(command), stamp, line_num, line_id FROM com_{$table_name}";
        $sql .= " WHERE line_num BETWEEN  {$start} AND {$end} order by line_num";
        return self::fetchAllRows($sql);
    }

    public function retrieveInfoByFilter($table_name, $start, $end){
        $sql = "SELECT DISTINCT(command), stamp, command_time, line_num, line_id FROM inf_{$table_name}";
        $sql .= " WHERE line_num BETWEEN  {$start} AND {$end} order by line_num";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveNextBufferRowQty($table_name){
        $sql = "SELECT line_num, command FROM com_{$table_name}";
        $sql .= " where command IN ('ExecuteSpatialQuery', 'NextBuffer', 'CloseStream') order by line_num";
        return self::fetchAllRows($sql);
    }

    public function retrieveNextBufferRowQtyAlt($table_name){
        $sql = "select distinct c.line_num, i.line_num as inum, c.command, i.command as icmd from com_{$table_name} c
		right join inf_{$table_name} i
		ON c.line_id = i.line_id
		where c.command IN ('ExecuteSpatialQuery', 'NextBuffer', 'CloseStream')
		order by i.line_num";
        return self::fetchAllRows($sql);
    }
    public function retrieveSingleCommand($table_name, $linenum){
        $sql = "SELECT DISTINCT(command), stamp, line_num, line_id FROM com_{$table_name}";
        $sql .= " WHERE line_num = {$linenum}";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveTraceInfo(){
        $sql = "SELECT id, trace_name, empno, incno, trcno, stamp, file_name, description, stamp FROM trace_storage order by stamp desc";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveLongValueErrors($table_name){
        $sql = "SELECT a.line_num as linenum, a.command as thecommand, b.command as theerror from com_{$table_name} a, inf_{$table_name} b ";
        $sql .= "where b.line_id = a.line_id ";
        $sql .= "and b.command like 'Long:         -%' ";
        $sql .= "and b.command not like 'Long:         -1'";
        
        return self::fetchAllRows($sql);
    }
    
    public function retrieveLongCommands($com_table_name){
        $sql = "WITH Deltas as (
                    SELECT
                    line_id,
                    line_num,
                    command, 
                    coalesce(
                        lead(line_num) over(order by stamp desc),
                        first_value(line_num) over(order by stamp asc)
                    ) as inf_num,
                    stamp - lag(stamp, 1) OVER (ORDER BY line_id) delta
                    FROM com_{$com_table_name}
                    ) 
                SELECT inf_num, line_num, command, delta from Deltas 
                where delta > '00:00:05.000' order by deltas desc;";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveCommandCount($com_table_name){
        $sql = "SELECT command, count(*) as cnt FROM com_{$com_table_name} GROUP BY command ORDER BY cnt DESC";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveTopTable($top_table_name){
        $sql = "SELECT * FROM top_{$top_table_name}";
        return self::fetchAllRows($sql);
    }
    
    public function retrieveTopTableFileName($top_table_name){
        $sql = "SELECT line FROM top_{$top_table_name} WHERE descriptor = 'File'";
        return self::fetchAllRows($sql);
    }
}

?>
