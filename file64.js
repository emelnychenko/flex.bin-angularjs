(function() {
    "use strict"

    angular.module('flex.bin.file64', []).directive('fxFile64', ['$q', '$timeout', function($q, $timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                fxStart: '='
            },
            link: function($scope, $element, $attrs, $model) {
                var $files      = new Array;
                var $collection = new Array;

                var $fxexec = function($file, $call) {
                    var $reader = new FileReader();

                    $reader.onabort = function($e) {
                        $model.$setValidity('abort', false);

                        if ($attrs.fxOnabort)
                            $scope.$parent.$eval(
                                $attrs.fxOnabort
                            );
                    };

                    $reader.onloadstart = function($e) {
                        if ($attrs.fxOnloadstart)
                            $scope.$parent.$eval(
                                $attrs.fxOnloadstart
                            );
                    };

                    $reader.onload = function($e) {
                        if ($attrs.fxOnload)
                            $scope.$parent.$eval(
                                $attrs.fxOnload
                            );
                    };

                    $reader.onloadend = function($e) {
                        if ($attrs.fxOnloadend)
                            $scope.$parent.$eval(
                                $attrs.fxOnloadend
                            );

                        $call($reader);
                    };

                    if ($attrs.fxOnprogress)
                        $reader.onprogress = $scope.$parent.$eval(
                            $attrs.fxOnprogress
                        );

                    $reader.onerror = function($e) {
                        $model.$setValidity('load', false);

                        if ($attrs.fxOnerror)
                            $reader.onerror = $scope.$parent.$eval(
                                $attrs.fxOnerror
                            );
                    };

                    $reader.readAsDataURL($file);
                };

                var $fxread = function($next) {
                    var $promises = new Array;

                    angular.forEach($files, function($file) {
                        var $accept = $attrs.fxType ? new RegExp(
                            $attrs.fxType.replace(/\*/i, '.*?')
                        ) : undefined;

                        if ($attrs.fxMinitem && $files.length < $attrs.fxMinitem) {
                            /**
                             *
                             */
                            $model.$setValidity("minitem", false);
                        } else if ($attrs.fxMaxitem && $files.length > $attrs.fxMaxitem) {
                            /**
                             *
                             */
                            $model.$setValidity("maxitem", false);
                        } else if ($attrs.fxMinsize && $file.size < $attrs.fxMinsize) {
                            /**
                             *
                             */
                            $model.$setValidity("minsize", false);
                        } else if ($attrs.fxMaxsize && $file.size > $attrs.fxMaxsize) {
                            /**
                             *
                             */
                            $model.$setValidity("maxsize", false);
                        } else if ($accept && !$accept.test($file.type)) {
                            /**
                             *
                             */
                            $model.$setValidity("accept", false);
                        } else {
                            var $defer = $q.defer();

                            $fxexec($file, function($reader) {
                                $defer.resolve({
                                    reader  : $reader,
                                    file    : $file,
                                });
                            });

                            $promises.push($defer.promise);
                        }
                    });

                   $q.all($promises).then(
                       function($dataset) {
                           $collection   = new Array;

                           angular.forEach($dataset, function($data) {
                               if ($data.reader.error === null)
                                   $collection.push({
                                       name: $data.file.name,
                                       size: $data.file.size,
                                       type: $data.file.type,
                                       base: $data.reader.result,
                                   });
                           });

                           $next($collection);
                       }
                   );
                }

                var $fxprepare = function() {
                    $files = $element[0].files;

                    $model.$setValidity('minsize',  null);
                    $model.$setValidity('maxsize',  null);
                    $model.$setValidity('minitem',  null);
                    $model.$setValidity('maxitem',  null);
                    $model.$setValidity('accept',   null);
                    $model.$setValidity('abort',    null);
                    $model.$setValidity('load',     null);

                    if ($attrs.fxStart) {
                        var $call = $scope.$parent.$eval(
                            $attrs.fxStart
                        );

                        if ($call) {
                            $call(); $scope.$apply();
                        }
                    }

                    var $defer = $q.defer();

                    $defer.resolve(function($collection) {
                        $model.$setViewValue(
                            $attrs.multiple ?
                                $collection : $collection[0]
                        );

                        if ($attrs.fxEnd) {
                            var $call = $scope.$parent.$eval(
                                $attrs.fxEnd
                            );

                            if ($call) $call();
                        }
                    });

                    $timeout(function() {
                        $defer.promise.then($fxread);
                    }, 0);
                };

                $element.bind('change', $fxprepare);
            }
        };
    }]);
})();
