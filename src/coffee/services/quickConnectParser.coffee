
###
    A helper service that can parse quick connect parameters
    Possible cases:
        ssh               user@host
        ssh               user@host   -p port
        ssh               user@host   -pport

        ssh    -p port    user@host
        ssh    -pport     user@host
###
alfredDirective.factory 'quickConnectParse', () ->
    ###
        Parses parameters
        @param input string that contains one of the possible cases
    ###
    parse : (input) ->
        options = {}

        cmd = null

        ARGS = [
            ['-p', '--port [NUMBER]', 'Port to connect to on the remote host.'],
        ]

        parser = new optparse.OptionParser(ARGS)

        parser.on 'port', (name, value) ->
            options.port = value

        parser.on 0, (value) ->
            cmd = value

        parser.on 1, (value) ->
            value = value.split('@')
            if value.length is 2
                options.ssh_username = value[0]
                options.hostname = value[1]

        parser.on 2, (value) ->
            options.other_args = value

        query = input.replace(/\s+@/g, '@').replace(/@\s+/g, '@').split(/\s+/) # remove duplicate white spaces in a string
        parser.parse(query)

        if cmd is 'ssh'
            if not options.ssh_username or not options.hostname or options.other_args?
                return {}
            options.port = 22 if not options.port?
            return options

        return {}