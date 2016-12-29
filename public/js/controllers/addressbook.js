angular.module('mean.system').controller('AddressBookController', ['$scope', '$uibModal', '$log', '$AddressBookService', '$SessionService', 'lodash', function($scope, $uibModal, $log, $AddressBookService, $SessionService, lodash) {
    $scope.list = [];
    $scope.seletedContact = null;
    $scope.monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    $scope.firstToUpperCase = function(str) {
    	return str.substr(0, 1).toUpperCase() + str.substr(1);
	}



    $scope.getAllcontacts = function() {
        var authUser = $SessionService.user();
        $AddressBookService.getAllAddressBook(authUser.id, function(response) {
            $scope.list = [];
            $scope.AllContacts = response.result;
            $scope.AllContactsCount = Object.keys($scope.AllContacts).length;
            angular.forEach($scope.AllContacts, function(value, key) {
                var name = value.name;
                var category = value.category;
                var nameOrderChar = name.charAt(0).toUpperCase();
                value.categoryLetter = category.charAt(0).toUpperCase();
                value.nameOrderChar = nameOrderChar;
                value.name = $scope.firstToUpperCase(value.name);
                value.category = $scope.firstToUpperCase(value.category);
                var dob = new Date(value.dob);
                var day = dob.getDate();
                var monthIndex = dob.getMonth();
                var year = dob.getFullYear();
                value.dobShow = day + '-' + $scope.monthNames[monthIndex] + '-' + year;

                var itemIn = true;
                var itemArray = {};
                itemArray.contactlist = [];


                if ($scope.list.length > 0) {
                    angular.forEach($scope.list, function(listValue, listKet) {
                        if (listValue.alphabet == nameOrderChar) {
                            itemIn = false;
                            listValue.contactlist.push(value);
                        }
                    });
                    if (itemIn) {
                        itemArray.alphabet = nameOrderChar;
                        itemArray.contactlist.push(value);
                        $scope.list.push(itemArray);
                    }
                } else {
                    $scope.seletedContact = value;
                    itemArray.alphabet = nameOrderChar;
                    itemArray.contactlist.push(value);
                    $scope.list.push(itemArray);
                }
            });

        });
    }

    $scope.getAllcontacts();


    $scope.noteColor = '#F781BF';
    $scope.colorsel = function(colour) {
        $scope.noteColor = colour;
    }

    $scope.animationsEnabled = true;

    $scope.addNewAddressBook = function(size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'addressBookCreate.html',
            controller: 'AddAddressBookController',
            size: size,
            resolve: {
                items: function() {
                    return {};
                }
            }
        });

        modalInstance.result.then(function(serverMsg) {
            $scope.selected = serverMsg;
            $scope.getAllcontacts();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });

    }



    $scope.getContactDetails = function($parentIndex, $index) {
        angular.forEach($scope.list, function(value, key) {
            if (key == $parentIndex) {
                angular.forEach(value.contactlist, function(valueContactlist, keyContactlist) {
                    if ($index == keyContactlist) {
                        $scope.seletedContact = valueContactlist;
                    }
                });
            }
        });
    }

    $scope.updateConatct = function(size){

    	var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'addressBookEdit.html',
            controller: 'AddAddressBookController',
            size: size,
            resolve: {
                items: function() {
                    return $scope.seletedContact;
                }
            }
        });

        modalInstance.result.then(function(serverMsg) {
            $scope.selected = serverMsg;
            $scope.getAllcontacts();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });


    }

    $scope.deleteContact = function(size){
    	var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'addressBookDelete.html',
            controller: 'AddAddressBookController',
            size: size,
            resolve: {
                items: function() {
                    return $scope.seletedContact;
                }
            }
        });

        modalInstance.result.then(function(serverMsg) {
            $scope.selected = serverMsg;
            $scope.getAllcontacts();
        }, function() {
        	$scope.getAllcontacts();
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    

    $scope.importEmailContact = function(size){
    	var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'importEmailContact.html',
            controller: 'AddAddressBookController',
            size: size,
            resolve: {
                items: function() {
                    return {};
                }
            }
        });

        modalInstance.result.then(function(serverMsg) {
            $scope.selected = serverMsg;
            $scope.getAllcontacts();
        }, function() {
        	$scope.getAllcontacts();
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

}]);



angular.module('mean.system').controller('AddAddressBookController', ['$scope', '$window', '$uibModalInstance', 'items', '$AuthService', 'FlashService', '$timeout', '$AddressBookService', '$SessionService','$auth', function($scope, $window, $uibModalInstance, items, $AuthService, FlashService, $timeout, $AddressBookService, $SessionService,$auth) {

    $scope.item = items;

    if($scope.item.dob!=undefined){
    	$scope.item.dob = new Date($scope.item.dob);
    }

    $scope.today = function() {
        $scope.item.dob = new Date();
    };


    $scope.clear = function() {
        $scope.item.dob = null;
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };

    $scope.setDate = function(year, month, day) {
        $scope.dob = new Date(year, month, day);
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
        opened: false
    };

    $scope.popup2 = {
        opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [{
        date: tomorrow,
        status: 'full'
    }, {
        date: afterTomorrow,
        status: 'partially'
    }];

    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    }



    $scope.close = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.Create = function(item) {
        var authUser = $SessionService.user();
        $scope.item.UserId = authUser.id;
        $AddressBookService.create($scope.item, function(response) {
            FlashService.show();
            var serverMsg = { resStatus: response.resStatus, msg: response.msg };
            if (response.resStatus == "error") {
                $scope.serverMsg = serverMsg;
            } else if (response.resStatus == "success") {
                serverMsg = { resStatus: response.resStatus, msg: 'Contact Successfully Add', verifyId: response.result };
                $scope.serverMsg = serverMsg;
                $timeout(function() {
                    $uibModalInstance.close(serverMsg);
                }, 1000);
            }
            FlashService.hide();
        });

    };


    $scope.updateContact = function(item){
    	$AddressBookService.updateAddressBook(item.id, item, function(response){
    		FlashService.show();
            var serverMsg = { resStatus: response.resStatus, msg: response.msg };
            if (response.resStatus == "error") {
                $scope.serverMsg = serverMsg;
            } else if (response.resStatus == "success") {
                serverMsg = { resStatus: response.resStatus, msg: 'Contact Successfully Update', verifyId: response.result };
                $scope.serverMsg = serverMsg;
                $timeout(function() {
                    $uibModalInstance.close(serverMsg);
                }, 1000);
            }
            FlashService.hide();
    	});
    }

    $scope.deleteContact = function(item){
    	$AddressBookService.deleteAddressBook(item.id,function(response){
    		FlashService.show();
            var serverMsg = { resStatus: response.resStatus, msg: response.msg };
            if (response.resStatus == "error") {
                $scope.serverMsg = serverMsg;
            } else if (response.resStatus == "success") {
                serverMsg = { resStatus: response.resStatus, msg: 'Contact Successfully Delete', verifyId: response.result };
                $scope.serverMsg = serverMsg;
               
                    $uibModalInstance.close(serverMsg);
                
            }
            FlashService.hide();
    	});
    }


     $scope.authenticate = function(provider) {
       $auth.authenticate(provider);
       console.log($auth.authenticate(provider));
    };

}]);
