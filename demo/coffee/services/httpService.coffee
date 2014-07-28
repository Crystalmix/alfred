
httpServices = angular.module(
    'httpServices',
    ['ngResource']
)

httpServices.factory 'Connections', ['$resource',
    ($resource) ->
        $resource('connections.json', {}, {
            query:
                method:'GET'
                isArray: yes
        });
    ]

httpServices.factory 'Histories', ['$resource',
    ($resource) ->
        $resource('histories.json', {}, {
            query:
                method:'GET'
                isArray: yes
        });
    ]

