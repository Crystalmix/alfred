
alfredDirective.factory 'quickConnectParse', () ->
    ###
        A hepler service that can parse quick connect parameters
        Possible cases:
                ssh               user@host
                ssh               user@host   -p port
                ssh               user@host   -pport

                ssh    -p port    user@host
                ssh    -pport     user@host
    ###
    trimArray = (array) ->
        for i in [0...array.length]
            array[i] = $.trim(array[i])
        return array;

    parse : (input) ->
        options = {}
        if input.indexOf('ssh') isnt -1
            inputArray = input.split('ssh')
            if inputArray.length is 2 and inputArray[0] is ""
                input = inputArray[1].trim()
                if input and input.length > 2
                    inputArray = _.compact(input.split("@"))
                    if inputArray.length is 2
                        leftInputArray  = inputArray[0].trim()
                        rightInputArray = inputArray[1].trim()
                        leftInputArray  = trimArray(_.compact(leftInputArray.split(" ")))
                        rightInputArray = trimArray(_.compact(rightInputArray.split(" ")))

                        if leftInputArray.length >= 2 and leftInputArray.indexOf('-p') isnt -1
                            if leftInputArray.length is 3 and leftInputArray[0] is "-p"
                                options.port = parseInt(leftInputArray[1])
                            else if leftInputArray.length is 2 and leftInputArray[0].indexOf('-p') is 0
                                options.port = parseInt(leftInputArray[0].slice(2))
                            else
                                return {}
                        else if leftInputArray.length >= 2 and leftInputArray.indexOf('-p') is -1
                            return {}
                        options.ssh_username = leftInputArray[leftInputArray.length - 1]

                        if rightInputArray.length >=2 and rightInputArray.indexOf("-p") isnt -1
                            if rightInputArray.length is 2 and rightInputArray[1].indexOf("-p") is 0
                                options.port = parseInt(rightInputArray[1].slice(2))
                            else if rightInputArray.length is 3 and rightInputArray[1] is "-p"
                                options.port = parseInt(rightInputArray[2])
                            else
                                return {}
                        else if rightInputArray.length >=2 and rightInputArray.indexOf("-p") is -1
                            return {}
                        options.hostname = rightInputArray[0]
                        if not options.port
                            options.port = 22

                        return options
        return {}