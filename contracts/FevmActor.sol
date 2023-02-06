// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// FEVM Actor API
import {MarketAPI} from "@zondax/filecoin-solidity/contracts/v0.8/MarketAPI.sol";
import {CommonTypes} from "@zondax/filecoin-solidity/contracts/v0.8/types/CommonTypes.sol";
import {MarketTypes} from "@zondax/filecoin-solidity/contracts/v0.8/types/MarketTypes.sol";
import {BigInt} from "@zondax/filecoin-solidity/contracts/v0.8/cbor/BigIntCbor.sol";
import {Misc} from "@zondax/filecoin-solidity/contracts/v0.8/utils/Misc.sol";

address constant CALL_ACTOR_ID = 0xfe00000000000000000000000000000000000005;
uint64 constant DEFAULT_FLAG = 0x00000000;
uint64 constant METHOD_SEND = 0;

library HyperActor {
    address constant CALL_ACTOR_ADDRESS =
        0xfe00000000000000000000000000000000000003;

    function convert(uint256 _a) internal pure returns (uint64) {
        return uint64(_a);
    }

    function call_actor_id(
        uint64 method,
        uint256 value,
        uint64 flags,
        uint64 codec,
        bytes memory params,
        uint64 id
    ) internal returns (bool, int256, uint64, bytes memory) {
        (bool success, bytes memory data) = address(CALL_ACTOR_ID).delegatecall(
            abi.encode(method, value, flags, codec, params, id)
        );
        (int256 exit, uint64 return_codec, bytes memory return_value) = abi
            .decode(data, (int256, uint64, bytes));
        return (success, exit, return_codec, return_value);
    }

    function call_actor_address(
        uint64 method,
        uint256 value,
        uint64 flags,
        uint64 codec,
        bytes memory params,
        bytes memory filAddress
    ) internal returns (bool, int256, uint64, bytes memory) {
        (bool success, bytes memory data) = address(CALL_ACTOR_ADDRESS)
            .delegatecall(
                abi.encode(method, value, flags, codec, params, filAddress)
            );
        (int256 exit, uint64 return_codec, bytes memory return_value) = abi
            .decode(data, (int256, uint64, bytes));
        return (success, exit, return_codec, return_value);
    }

    function call(
        uint method,
        bytes memory filAddress,
        bytes memory params,
        uint64 codec
    ) internal returns (bytes memory) {
        return
            call_inner(convert(method), filAddress, params, codec, msg.value);
    }

    function call_inner(
        uint method,
        bytes memory filAddress,
        bytes memory params,
        uint64 codec,
        uint amount
    ) internal returns (bytes memory) {
        (
            bool _success,
            int256 exit_code,
            uint64 _return_codec,
            bytes memory return_value
        ) = call_actor_address(
                convert(method),
                amount,
                DEFAULT_FLAG,
                codec,
                params,
                filAddress
            );
        require(
            exit_code == 0,
            string.concat(
                "actor error code ",
                Strings.toString(uint256(exit_code))
            )
        );
        return return_value;
    }
}
