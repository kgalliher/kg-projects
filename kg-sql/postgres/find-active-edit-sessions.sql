/*
	Ken Galliher - 08/12/15
	If a user is in an edit session and has an active state(s), compare the process_information 
	table's sde_id to the sde.states table to find who is editing.

*/
column spid format a15
column username format a15
column start_time format a15
column state_id format a10
SELECT nodename as username, server_id as spid, start_time, c.state_id, direct_connect
FROM sde.process_information b, sde.state_locks a, sde.states c
WHERE b.sde_id = a.sde_id AND a.state_id = c.state_id;