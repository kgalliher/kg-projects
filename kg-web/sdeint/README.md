# SDE Interceptor
## PHP and JavaScript Version 1.0

The application opens an SDE Intercept trace and parses each SDE command and its associated info into database tables.

The tables are then queried to extract relevant performance and error information making trace analysis much easier.

![SDE Interceptor Car](img/sdeinterceptorcar.gif)

---
### Requires a web server and database (Postgres used here).
The database must contain a single table called trace_storage to track exiting traces and file names.

```sql
CREATE TABLE billybob.trace_storage
(
    id integer,
    empno character varying(5) COLLATE pg_catalog."default",
    incno character varying(12) COLLATE pg_catalog."default",
    trcno character varying(5) COLLATE pg_catalog."default",
    trace_name character varying(50) COLLATE pg_catalog."default",
    stamp "time(2) without time zone"(2),
    file_name character varying(255) COLLATE pg_catalog."default",
    description character varying(140) COLLATE pg_catalog."default"
)
```
All other tables will be generated upon upload of a trace.
