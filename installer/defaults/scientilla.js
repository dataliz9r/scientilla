module.exports.scientilla = {
    "ldap": {
        "connection": {
            "url": "",
            "bindDn": "",
            "bindCredentials": "",
            "searchBase": "",
            "searchFilter": "",
            "cache": true
        },
        "domain": "iit.it"
    },
    "externalConnectors": {
        "elsevier": {
            "scopus": {
                "url": "https://api.elsevier.com",
                "apiKey": "",
                "token": ""
            },
            "scival": {
                "url": "http://sais.scivalcontent.com",
                "clientKey": ""
            }
        }
    },
    "institute": {
        "name": "Istituto Italiano di Tecnologia",
        "slug": "istituto-italiano-di-tecnologia",
        "shortname": "IIT",
        "country": "Italy",
        "city": "Genoa",
        "scopusId": "60102151"
    },
    "mainInstituteImport": {
        "userImportUrl": "http://example.com/users",
        "usersCreationCondition": {
            "attribute": "scientificRole",
            "value": true
        },
        "officialGroupsImportUrl": "http://example.com/groups"
    },
    "crons": [
        {
            "name": "daily",
            "enabled": true,
            "time": "0 0 1 * * *",
            "jobs": [
                {
                    "fn": "Backup.makeBackup",
                    "params": []
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:external:all"
                    ]
                },
                {
                    "fn": "Status.disable",
                    "params": []
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:synchronize:scopus"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:clean:sources"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:clean:institutes"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "documents:clean:copies"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:people"
                    ]
                },
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "import:groups"
                    ]
                },
                {
                    "fn": "Status.enable",
                    "params": []
                }
            ]
        },
        {
            "name": "monitor",
            "enabled": true,
            "time": "0 0 * * * *",
            "jobs": [
                {
                    "fn": "GruntTaskRunner.run",
                    "params": [
                        "monitor"
                    ]
                }
            ]
        }
    ],
    "registerEnabled": true,
    "maxUserFavorite": "5",
    "maxGroupFavorite": "5"
}