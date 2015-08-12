/*
	08/12/15
	Not sure where this came from but good for checking connected users on a Postgres instance.
*/
SELECT p.pid AS pid, application_name, datname, usename,
	CASE
		WHEN client_port=-1
			THEN 'local pipe'
		WHEN length(client_hostname)>0
			THEN client_hostname||':'||client_port
		ELSE textin(inet_out(client_addr))||':'||client_port
	END AS client,
	date_trunc('second', backend_start) AS backend_start, 
	CASE WHEN state='active' 
		THEN date_trunc('second', query_start)::text 
		ELSE '' 
	END AS query_start,
	date_trunc('second', xact_start) AS xact_start, 
	state, 
	date_trunc('second', state_change) AS state_change, 
		(SELECT Min(l1.pid) 
			FROM pg_locks l1 
			WHERE GRANTED 
			AND (relation 
			IN (SELECT relation 
				FROM pg_locks l2 
				WHERE l2.pid=p.pid 
				AND NOT granted) 
				OR transactionid 
				IN (SELECT transactionid 
				FROM pg_locks l3 
				WHERE l3.pid=p.pid AND NOT granted))) AS blockedby,
	query AS query,
	CASE
		WHEN query_start IS NULL OR state<>'active'
			THEN false 
		ELSE query_start < now() - '10 seconds'::interval
	END AS slowquery
FROM pg_stat_activity p
--WHERE application_name NOT LIKE 'Postgres Enterprise Manager%'
ORDER BY 5 ASC