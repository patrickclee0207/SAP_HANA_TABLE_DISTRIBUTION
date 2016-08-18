function createTimestamp(rs) {
	return {
		"BASE_SCHEMA_NAME" : rs.getString(1),
		"BASE_OBJECT_NAME" : rs.getString(2),
		"PART_ID" : rs.getString(3),
		"MEMORY_SIZE_IN_TOTAL" : rs.getString(4),
		"RECORD_COUNT" : rs.getString(5),
		"HOST" : rs.getString(6),
	};
}

try {

	var view = $.request.parameters.get("view");

	var body = "";
	var list = [];
	var query = "select  distinct b.base_schema_name, b.base_object_name, a.part_id, a.memory_size_in_total,a.record_count, a.host "
			+ "from \"SYS\".\"OBJECT_DEPENDENCIES\" b "
			+ "join \"SYS\".\"M_CS_TABLES\" a on b.base_schema_name = a.schema_name and b.base_object_name = a.table_name "
			+ "WHERE "
			+ "dependent_schema_name = '_SYS_BIC' and "
			+ "dependent_object_name like '"
			+ view
			+ "' and "
			+ "dependent_object_type = 'VIEW' and "
			+ "base_object_type = 'TABLE' "
			+ "order by a.memory_size_in_total desc";
	$.trace.debug(query);
	var conn = $.db.getConnection();
	var pcall = conn.prepareCall(query);

	pcall.execute();
	var rs = pcall.getResultSet();

	while (rs.next()) {
		list.push(createTimestamp(rs));
	}

	pcall.close();
	conn.commit();
	conn.close();

	body = JSON.stringify(list);

	$.response.contentType = "application/json; charset=UTF-8";
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
} catch (e) {
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(e.message);
}