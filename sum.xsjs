function createTimestamp(rs) {
	return {
		"HOST" : rs.getString(1),
		"SUM(MEMORY_SIZE_IN_TOTAL)" : rs.getString(2)
	};
}

try {

	var view = $.request.parameters.get("view");

	var body = "";
	var list = [];
	var query = "SELECT HOST, sum(memory_size_in_total), sum(record_count) from ("
			+ "select  distinct b.base_schema_name, b.base_object_name, a.part_id, a.memory_size_in_total, a.record_count, a.host "
			+ "from \"SYS\".\"OBJECT_DEPENDENCIES\" b "
			+ "join \"SYS\".\"M_CS_TABLES\" a on b.base_schema_name = a.schema_name and b.base_object_name = a.table_name "
			+ "WHERE " + "dependent_schema_name = '_SYS_BIC' and "
			+ "dependent_object_name like '" + view + "' and "
			+ "dependent_object_type = 'VIEW' and "
			+ "base_object_type = 'TABLE' "
			+ "order by a.memory_size_in_total desc) " + "GROUP BY HOST";
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