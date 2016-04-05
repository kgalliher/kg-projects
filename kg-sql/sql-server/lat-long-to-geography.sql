DECLARE pt_curse CURSOR FOR
	SELECT latCol, lonCol, id FROM TableWithLatLong

DECLARE @latVar numeric(38,8), @lonVar numeric(38,8), @id int;

OPEN pt_Curse;
FETCH NEXT FROM pt_curse INTO @latVar, @lonVar, @id

WHILE @@FETCH_STATUS = 0
BEGIN
	UPDATE TableWithLatLong SET shape = geography::Point(@latVar, @lonVar, 4326) WHERE id = @id;
	FETCH NEXT FROM pt_curse INTO @latVar, @lonVar, @id
END;

CLOSE pt_curse;
DEALLOCATE pt_curse;
