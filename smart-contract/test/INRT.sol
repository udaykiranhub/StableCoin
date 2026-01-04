// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {INRT} from "../src/INRT.sol";

contract INRTTest is Test {
    INRT public inrt;

    function setUp() public {
        inrt = new INRT();
     
    }


}