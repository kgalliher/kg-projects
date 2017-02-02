SET NOCOUNT ON

DECLARE @versions_info_tab TABLE
(
	ver_info_state_id int,
	source_lin int,
	com_anc_id int,
	lin_name int,
	state_id int
)

DECLARE @blocking_list TABLE
(
	state_id int,
	name varchar(100)
)

DECLARE @delta_table_info TABLE
(
	a_table_name nvarchar(50),
	d_table_name nvarchar(50),
	a_table_count int,
	d_table_count int
)

DECLARE @ver_count int = (SELECT COUNT(*) FROM sde.SDE_versions)
DECLARE @state_count int = (SELECT COUNT(*) FROM sde.sde_states)
DECLARE @state_lineages_count int = (SELECT COUNT(*) FROM sde.SDE_state_lineages)
DECLARE @last_compress DATE = (SELECT MAX(compress_start) FROM sde.SDE_compress_log)

DECLARE @ver_info_state_id int, @message varchar(100) = '', @source_lin int, 
		@com_anc_id int, @lin_name int, @state_id int, @ver_blocking int = 0,
		@cur_max_state int, @pos int, @idx int, @s1 int = 0, @s2 int = 0, @s3 
		int = 0, @s4 int = 0, @s5 int = 0, @blocking_ver_name nvarchar(100), 
		@blocking_ver_count int, @table_info_name varchar(100), @table_info_reg_id int,
		@table_info_owner varchar(100), @p_stmt nvarchar(200),@a_stmt nvarchar(max), 
		@d_stmt nvarchar(max), @row_count int

DECLARE table_info_cur CURSOR FOR
	SELECT owner, table_name, registration_id
	FROM sde.sde_table_registry
	WHERE sde.sde_table_registry.object_flags&8 = 8
		
DECLARE ver_list_cur CURSOR FOR
	SELECT DISTINCT state_id
	  FROM sde.sde_versions
	  WHERE name = 'DEFAULT' AND owner = 'sde'
	  ORDER BY state_id;

SELECT @state_id=state_id, @lin_name = lineage_name FROM sde.sde_states
WHERE state_id = (SELECT state_id FROM sde.sde_versions WHERE name = 'DEFAULT' AND owner = 'SDE');

SET @cur_max_state = @state_id
PRINT '==========Versioning Statistics================='
PRINT ''
PRINT 'Number of versions: ' + CONVERT(varchar, @ver_count) + '   =============='
OPEN ver_list_cur
FETCH NEXT FROM ver_list_cur INTO @ver_info_state_id
	WHILE @@FETCH_STATUS = 0
	BEGIN
		SELECT @row_count = COUNT(*) FROM sde.sde_state_lineages WHERE lineage_name = @lin_name AND lineage_id <= @state_id
		SELECT @source_lin = lineage_name FROM sde.SDE_states where state_id = @ver_info_state_id
		;WITH sel_max_lin_id AS 
		(
			SELECT lineage_id FROM sde.sde_state_lineages WHERE lineage_name = @lin_name AND lineage_id <= @state_id
			INTERSECT
			SELECT lineage_id FROM sde.sde_state_lineages WHERE lineage_name = @source_lin AND lineage_id <= @ver_info_state_id
		)
		SELECT @com_anc_id = (SELECT MAX(lineage_id) FROM sel_max_lin_id)

		INSERT INTO @versions_info_tab VALUES(@ver_info_state_id, @source_lin, @com_anc_id, @lin_name, @state_id);

	FETCH NEXT FROM ver_list_cur INTO @ver_info_state_id
	
	END;
CLOSE ver_list_cur

-- Generate table of blocking version names
;WITH get_block_ver AS
(
   SELECT owner+'.'+name as name, state_id FROM sde.sde_versions
       WHERE state_id IN
           (SELECT DISTINCT lineage_id FROM sde.sde_state_lineages
                WHERE lineage_name IN
                 (SELECT DISTINCT lineage_name FROM sde.sde_state_lineages
                  WHERE lineage_id IN (SELECT ver_info_state_id FROM @versions_info_tab)  -- using only the values from the cursor which filters out the default version
			  )
		)	
)
INSERT INTO @blocking_list
SELECT state_id, name FROM get_block_ver WHERE state_id < @ver_info_state_id -- AND name NOT LIKE '%SYNC%'

DECLARE blocking_ver_name_cur CURSOR FOR
	SELECT name FROM @blocking_list
SET @blocking_ver_count = (SELECT COUNT(*) FROM @blocking_list)

PRINT 'Number of versions blocking DEFAULT: ' + CONVERT(varchar, @blocking_ver_count)
PRINT 'Blocking Versions: '
OPEN blocking_ver_name_cur
FETCH NEXT FROM blocking_ver_name_cur INTO @blocking_ver_name
WHILE @@FETCH_STATUS = 0
	BEGIN
		PRINT '    ' + @blocking_ver_name
		FETCH NEXT FROM blocking_ver_name_cur INTO @blocking_ver_name
	END
CLOSE blocking_ver_name_cur
PRINT ''
PRINT 'Number of states: ' + CONVERT(varchar, @state_count)
PRINT 'Number of state lineages: ' + CONVERT(varchar, @state_lineages_count)
PRINT 'Last Compress: ' + CONVERT(varchar, @last_compress)
PRINT ''

OPEN table_info_cur
FETCH NEXT FROM table_info_cur INTO @table_info_owner, @table_info_name, @table_info_reg_id
WHILE @@FETCH_STATUS = 0
	BEGIN
		DECLARE @a_count int, @d_count int
		PRINT 'Table:  ' + @table_info_owner + '.'+  @table_info_name + ' (' + CONVERT(varchar, @table_info_reg_id) + ')'
		SET @a_stmt = N'SELECT @a_count=COUNT(*) FROM ' + @table_info_owner + '.a' + CONVERT(varchar, @table_info_reg_id)
		EXEC sp_executesql @query = @a_stmt, @params = N'@a_count INT OUTPUT', @a_count = @a_count OUTPUT

		SET @d_stmt = N'SELECT @d_count=COUNT(*) FROM ' + @table_info_owner + '.D' + CONVERT(varchar, @table_info_reg_id)
		EXEC sp_executesql @query = @d_stmt, @params = N'@d_count INT OUTPUT', @d_count = @d_count OUTPUT

		--SET @p_stmt = N'SELECT ROUND(COUNT(*) / ' + CONVERT(varchar,@ver_count) + ' * 100, 2) as [% Of Default] FROM ' + @table_info_owner + '.a' + CONVERT(varchar, @table_info_reg_id) +
		--			' WHERE sde_state_id IN (SELECT lineage_id FROM sde.sde_state_lineages WHERE lineage_name = ' + CONVERT(nvarchar,@lin_name) + ' AND lineage_id = ' + CONVERT(nvarchar,@state_id) + ')'
		--EXEC sp_executesql @query = @p_stmt, @params = N'@d_count INT OUTPUT', @d_count = @d_count OUTPUT
		INSERT INTO @delta_table_info VALUES 
		(
			@table_info_owner + '.a' + CONVERT(varchar, @table_info_reg_id),
			@table_info_owner + '.D' + CONVERT(varchar, @table_info_reg_id),
			@a_count,
			@d_count
		)
		PRINT 'Adds Count:    ' + CONVERT(varchar, @a_count)
		PRINT 'Deletes Count: ' + CONVERT(varchar, @d_count)
		PRINT ''
		FETCH NEXT FROM table_info_cur INTO @table_info_owner, @table_info_name, @table_info_reg_id
	END
CLOSE table_info_cur

SELECT * FROM @versions_info_tab
--DECLARE x_cur CURSOR FOR
--	SELECT lin_name, ver_info_state_id FROM @versions_info_tab
--	DECLARE @f1 int, @f2 int
--OPEN x_cur
--FETCH NEXT FROM x_cur INTO @f1, @f2
--WHILE @@FETCH_STATUS = 0
--BEGIN
-- SELECT @row_count=COUNT(*) FROM sde.sde_state_lineages WHERE lineage_name = @f1 AND lineage_id <= @f2;
-- PRINT 'Lineages per version: ' + CONVERT(varchar,@row_count)
-- FETCH NEXT FROM x_cur INTO @f1, @f2
--END
--CLOSE x_cur
--DEALLOCATE x_cur

DEALLOCATE ver_list_cur
DEALLOCATE blocking_ver_name_cur
DEALLOCATE table_info_cur


select * from sde.SDE_versions