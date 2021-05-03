// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GeoAsset {
    
    string globalId;
    address user;
    string public lat;
    string public lon;
    STATUSES public status;
    
    enum STATUSES {
        CREATED,
        COMPLETE
    }
    
    event Action (
        string name,
        address account,
        uint timestamp
    );
    
    constructor(string memory _lat, string memory _lon) public {
        user = msg.sender;
        status = STATUSES.CREATED;
        lat = _lat;
        lon = _lon;
        
        emit Action("CREATED", user, block.timestamp);
    }
    
    
    function update(string memory _globalId) public {
        require(msg.sender == user);
        require(status == STATUSES.CREATED);
        
        globalId = _globalId;
        status = STATUSES.COMPLETE;
        
        emit Action("COMPLETE", user, block.timestamp);
    }
}