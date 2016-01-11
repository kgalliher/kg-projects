<?php
require_once("../includes/database.php");

class Geoprocessor {
	
	public static function features($table_name_a, $geom_field_a){
		global $database;
		$sql = $database->escape_value("SELECT ST_AsGeoJSON({$table_name_a}.{$geom_field_a}) as gp_geom FROM {$table_name_a}");
		return self::generateGeoJson($sql, "features");
	}

	public static function st_intersects($table_name_a, $table_name_b, $geom_field_a, $geom_field_b){
		global $database;
		$sql = "SELECT ST_AsGeoJSON({$table_name_a}.{$geom_field_a}) as gp_geom FROM {$table_name_a}, {$table_name_b}";
		$sql .= " WHERE ST_Intersects({$table_name_a}.{$geom_field_a}, {$table_name_b}.{$geom_field_b}) ";
		return self::generateGeoJson($database->escape_value($sql), "intersects");
	}
	
	public static function st_buffer($table_name_a, $geom_field_a, $buff_dist){
		global $database;
		$sql = "SELECT ST_AsGeoJSON(ST_Buffer({$geom_field_a}, {$buff_dist})) as gp_geom FROM {$table_name_a}";
		return self::generateGeoJson($database->escape_value($sql), "buffer");
	}
	
	public static function st_union($table_name_a, $geom_field_a, $union_group_field){
		global $database;
		$sql = $database->escape_value("SELECT {$union_group_field}, ST_AsGeoJSON(ST_Multi(ST_Union({$table_name_a}.{$geom_field_a})))
									   as gp_geom FROM {$table_name_a} GROUP BY {$union_group_field}");
		return self::generateGeoJson($sql, "union");
	}
	
	public static function st_split($table_name_a, $geom_field_a, $table_name_splitter, $table_name_split_geomfield){
		global $database;
		$sql = "SELECT ST_AsGeoJSON(ST_Split({$table_name_a}.{$geom_field_a}, {$table_name_splitter}.{$table_name_split_geomfield})) as gp_geom ";
		$sql .= "FROM {$table_name_a}, {$table_name_splitter} WHERE splitter.choppa = 'vline'";
		
		return self::generateGeoJson($database->escape_value($sql), "split");
	}
	
	public static function st_buildArea($table_name_a, $geom_field_a){
		global $database;
		$sql = "SELECT ST_AsGeoJSON(ST_BuildArea({$table_name_a}.{$geom_field_a})) as gp_geom ";
		$sql .= "FROM {$table_name_a}";
		return self::generateGeoJson($sql, "build");
	}
	
	public function st_bbox($table_name_a, $geom_field_a){
		global $database;
		$sql = "SELECT ST_AsGeoJson(ST_SetSRID(ST_Extent({$table_name_a}.{$geom_field_a}), 4326)) as gp_geom";
		$sql .= " FROM {$table_name_a}";
		return self::generateGeoJson($database->escape_value($sql), "bbox");
	}
	
	public function generateGeoJson($sql, $gp_name){
		global $database;
		if (strlen(trim($parameters)) > 0) {
			if($gp_name == "intersects" || $gp_name == "split" || $gp_name == "bbox"){
				$sql .= " AND " . $parameters;
			}
			else {
				$sql .= " WHERE " . $parameters;
			}
		}
		if (strlen(trim($orderby)) > 0) {
			$sql .= " ORDER BY " . pg_escape_string($orderby) . " " . $sort;
		}
		if (strlen(trim($limit)) > 0) {
			$sql .= " LIMIT " . pg_escape_string($limit);
		}
		if (strlen(trim($offset)) > 0) {
			$sql .= " OFFSET " . pg_escape_string($offset);
		}
		
		$rs = DBAccess::find_by_sql($sql);
	
		$output    = '';
		$rowOutput = '';
		while ($row = $database->fetch_array($rs)) {
			$rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row['gp_geom'] . ', "properties": {';
			$props = '';
			$id    = '';
			foreach ($row as $key => $val) {
				if ($key != "geojson") {
					$props .= (strlen($props) > 0 ? ',' : '') . '"' . $key . '":"' . escapeJsonString($val) . '"';
				}
				if ($key == "id") {
					$id .= ',"id":"' . escapeJsonString($val) . '"';
				}
			}
			$rowOutput .= $props . '}';
			$rowOutput .= $id;
			$rowOutput .= '}';
			$output .= $rowOutput;
		}
		
		$output = '{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}';
		return $output;
	}
}

$geoproc = new Geoprocessor();