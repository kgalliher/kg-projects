/*
Ken Galliher - 08/12/15
Create a table in a non-SDE database.
Calculate points from an existing table's X and Y (or lat/long) columns.
*/
DROP TABLE myxytable;

CREATE TABLE myxytable
(
	id serial,
	name text,
	X numeric,
	Y numeric
);

INSERT INTO myxytable (name, X, Y)
SELECT 'name', ST_X(geom), ST_Y(geom)
FROM nyc_subway_stations;

alter table myxytable add geom geometry(POINT, 4326);

DO 
$$DECLARE 
	pt_curse CURSOR FOR SELECT x, y FROM myxytable FOR UPDATE; 
	x_coord myxytable.X%TYPE; 
	y_coord myxytable.Y%TYPE;
	
	
BEGIN
	OPEN pt_curse;
LOOP
	FETCH pt_curse INTO x_coord, y_coord;
	EXIT WHEN NOT FOUND;
	UPDATE myxytable SET geom = ST_GeomFROMText('POINT(' || cast(x_coord as text)|| ' ' || cast(y_coord as text) || ')''', 4326) WHERE CURRENT OF pt_curse;
END LOOP;
CLOSE pt_curse;
END$$;

SELECT id, x, y, st_astext(geom) from myxytable;
