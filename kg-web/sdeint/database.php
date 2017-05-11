<?php
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
    public function createTopTable($top_table){
        $sql = "create table {$top_table} (id serial, descriptor varchar(30), line text);";
        //echo "Top table: " . $sql . "<br />";
        try {
            $this->conn->exec($sql);
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
    public function createComTable($com_table){
        $sql = "create table {$com_table} (line_num bigint, line_id bigint, stamp time, command_time varchar(25), command text);";
        
        try {
            $this->conn->exec($sql);
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
    public function createInfTable($inf_table){
        //line_num, line_id, stamp, command_time, command
        $sql = "create table {$inf_table} (line_num bigint, line_id bigint, stamp time, command_time varchar(25), command text);";
        //echo $sql . "<br />";
        try {
            $this->conn->exec($sql);
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
    public function deleteTraces($trace_name, $id){
        $table_names = array("top_" . $trace_name, "com_" . $trace_name, "inf_" . $trace_name);
        $delete_from_storage_sql = "delete from trace_storage where trace_name = '{$trace_name}' and id = {$id}";
        try {
            $this->conn->exec($delete_from_storage_sql);
            foreach($table_names as $table){
                self::dropTable($table);
            }
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
        
    public function checkTableExists($table_name){
        try {
            $result = $this->conn->query("SELECT 1 FROM {$table_name} LIMIT 1");
        }
        catch(Exception $ex){
            return false;
        }
        return $result !== false;
    }
    
    public function dropTable($table_name){
        $sql = "DROP TABLE {$table_name}";
        try {
            if(self::checkTableExists($table_name)){
                $this->conn->exec($sql);
            }
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
    
    public function insertTop($table_name, $params){
        $sql = "INSERT INTO {$table_name} (descriptor, line)";
        $sql .= " VALUES (?, ?)";
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
    
    public function insertComInf($table_name, $params){
        ///$line_num, $line_id, $stamp, $cmd_time, $line
        $sql = "INSERT INTO {$table_name} (line_num, line_id, stamp, command_time, command)";
        $sql .= " VALUES ('{$params[0]}', '{$params[1]}', '{$params[2]}', '{$params[3]}', '{$params[4]}')";
        
        try {
            $this->conn->exec($sql);
            //$stmt->execute($params);
            //$this->conn->exec($index);
            
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            
        }
    }
    
    public function createComInfIndex($table_name){
        $index = "CREATE INDEX {$table_name}_idx ON {$table_name} (line_id)";
        try {
            $this->conn->exec($index);
            return 1;
        }
        catch (PDOException $ex){
            echo $ex->getMessage();
            return -1;
        }
    }
    
    public function retrieveLineCount($table_name){
        $sql = "select max(line_num) as max_line_count from inf_{$table_name}";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch();
        return $result;
    }
    public function retrieveCommands($table_name){
        $sql = "SELECT DISTINCT(command), stamp, line_num, line_id FROM com_{$table_name} order by line_num";
        $commands = array();
        //echo  $sql . "<br />";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    
    public function retrieveInfo($table_name, $line_num){
        $sql = "SELECT line_id, line_num, command, stamp FROM inf_{$table_name}";
        $sql .= " WHERE line_id = {$line_num} order by line_num";
        //echo  $sql . "<br />";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public function retrieveCommandsByFilter($table_name, $start, $end){
        $sql = "SELECT DISTINCT(command), stamp, line_num, line_id FROM com_{$table_name}";
        $sql .= " WHERE line_num BETWEEN  {$start} AND {$end} order by line_num";
        //echo $sql;
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    
    public function retrieveSingleCommand($table_name, $linenum){
        $sql = "SELECT DISTINCT(command), stamp, line_num, line_id FROM com_{$table_name}";
        $sql .= " WHERE line_num = {$linenum}";
        //echo $sql;
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public function retrieveTraceInfo(){
        $sql = "SELECT id, trace_name, empno, incno, trcno, stamp, file_name, description, stamp FROM trace_storage order by stamp desc";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    
    public function retrieveLongValueErrors($table_name){
        $sql = "SELECT a.line_num as linenum, a.command as thecommand, b.command as theerror from com_{$table_name} a, inf_{$table_name} b ";
        $sql .= "where b.line_id = a.line_id ";
        $sql .= "and b.command like 'Long:         -%' ";
        $sql .= "and b.command not like 'Long:         -1'";
        
        //echo $sql . "<br />";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
        
    }
    public function insertTraceProperties($params){
        $sql = "INSERT INTO trace_storage (empno, incno, trcno, trace_name, file_name, stamp, description) ";
        $sql .= "VALUES (?, ?, ?, ?, ?, ?, ?)";
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
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    
    public function retrieveCommandCount($com_table_name){
        $sql = "SELECT command, count(*) as cnt FROM com_{$com_table_name} GROUP BY command ORDER BY cnt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $row_count = $stmt->rowCount();
        if($row_count > 0){
            return $result;
        }
        else {
            $arr = array();
            array_push($arr, "No significant durations found.", "");
            return $arr;
        }
    }
    
    public function retrieveTopTable($top_table_name){
        $sql = "SELECT * FROM top_{$top_table_name}";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    
    public function retrieveTopTableFileName($top_table_name){
        $sql = "SELECT line FROM top_{$top_table_name} WHERE descriptor = 'File'";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
}
?>