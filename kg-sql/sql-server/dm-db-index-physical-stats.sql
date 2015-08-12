/*
	Ken Galliher - 08/12/15
	Discover index fragmentation for specific tables.
*/
SELECT  a.index_id, 
		name, 
		avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats (DB_ID(N'BBOXTEST'), OBJECT_ID(N'SDE.ROADS'), NULL, NULL, NULL) AS a
    JOIN sys.indexes AS b 
	ON a.object_id = b.object_id 
	AND a.index_id = b.index_id; 