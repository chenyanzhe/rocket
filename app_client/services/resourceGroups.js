function resourceGroups ($http) {
	return $http.get('/api/vm');
};

angular
    .module('inspinia')
    .service('resourceGroups', resourceGroups);