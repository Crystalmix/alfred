'use strict';


alfredDirective = angular.module("alfredDirective", ['cfp.hotkeys'])


alfredDirective.config (hotkeysProvider) ->
    ###
        'hotkeysProvider' is provider from angular.hotkeys.

        Switch default cheatsheet: hotkey '?'
    ###
    hotkeysProvider.includeCheatSheet = yes
