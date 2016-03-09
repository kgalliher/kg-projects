
/*
Ken Galliher - 08/12/15
This CTE can identify how many edits are made in a version.
Use the lineage_id to identify edits an a specific A or D table of a feature class.
*/
DECLARE @owner varchar(100), @version_name VARCHAR(100)
SET @version_name = 'DEFAULT'
SET @owner = (SELECT owner FROM sde.SDE_versions WHERE name = @version_name)

-- State and lineage info
DECLARE @parent_state_id INT, @state_id INT, @lineage_name INT
SET @state_id = (SELECT state_id FROM sde.SDE_versions WHERE owner = @owner AND name = @version_name)
SET @parent_state_id = (SELECT parent_state_id FROM sde.SDE_states WHERE state_id = @state_id)
SET @lineage_name = (SELECT lineage_name FROM sde.SDE_states WHERE state_id = @state_id)

--CTE to get all lineages in the version back to 0
;WITH stateCount AS
(
	SELECT lineage_id FROM sde.SDE_state_lineages
	WHERE lineage_name = @lineage_name AND lineage_id >= @parent_state_id
)

-- Just get the count
SELECT COUNT(*) FROM sde.a14 WHERE sde_state_id IN (SELECT lineage_id FROM stateCount)

