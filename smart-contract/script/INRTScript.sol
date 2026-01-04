// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {INRT} from "../src/INRT.sol";

contract INRTScript is Script {
    INRT public inrt;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        inrt = new INRT();

        vm.stopBroadcast();
    }
}
