<?php

class Session {
	
	private $logged_in = false;
	public $user_id;
	public $password;
	public $server;
	public $database;
	public $port;
	
	public function __construct(){
		session_start();
		$this->check_login();
	}
	
	private function check_login(){
		if(isset($_SESSION['user_id'])){
			$this->user_id = $_SESSION['user_id'];
			$this->password = $_SESSION['password'];
			$this->server = $_SESSION['user_id'];
			$this->database = $_SESSION['user_id'];
			$this->port = $_SESSION['port'];
			$this->logged_in = true;
		}
		else {
			unset($this->user_id);
			unset($this->password);
			unset($this->server);
			unset($this->database);
			unset($this->port);
			$this->logged_in = false;
		}
	}
	
	public function is_logged_in(){
		return $this->logged_in;
	}
	
	public function login($user){
		if($user){
			$this->user_id = $_SESSION['user_id'] = $user_id;
			$this->logged_in = true;
		}
	}
	
	public function logout(){
		unset($_SESSION['user_id']);
		unset($_SESSION['password']);
		unset($_SESSION['server']);
		unset($_SESSION['database']);
		unset($_SESSION['port']);
		
		unset($this->user_id);
		unset($this->password);
		unset($this->server);
		unset($this->database);
		unset($this->port);
		$this->logged_in = false;
	}
}

$session = new Session();

?>