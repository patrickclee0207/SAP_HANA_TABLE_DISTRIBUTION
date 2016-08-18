function createTimestamp(rs) {
	return {
		"HOST" : rs.getString(1),
		"FREE_PHYSICAL_MEMORY" : rs.getString(2),
		"USED_PHYSICAL_MEMORY" : rs.getString(3),
		"INSTANCE_TOTAL_MEMORY_USED_SIZE" : rs.getString(4)
	};
}

try {

	var body = "";
	var list = [];
	var query = "SELECT  host, FREE_PHYSICAL_MEMORY, USED_PHYSICAL_MEMORY, INSTANCE_TOTAL_MEMORY_USED_SIZE FROM \"SYS\".\"M_HOST_RESOURCE_UTILIZATION\"";
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