// Copyright (c) 2018 Intel Corporation. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/* eslint-disable camelcase */
const rclnodejs = require('../../index.js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('How many times do you want to run? ', (times) => {
  rl.question('The amount of data(KB) to be sent in one loop. ', (amount) => {
    amount = parseInt(amount, 10);
    const message = {
      layout: {
        dim: [
          {label: 'height',  size: 10, stride: 600},
          {label: 'width',   size: 20, stride: 60},
          {label: 'channel', size: 3,  stride: 4},
        ],
        data_offset: 0,
      },
      data: Uint8Array.from({length: 1024 * amount}, (v, k) => k)
    };

    rclnodejs.init().then(() => {
      console.log(`The publisher will publish a UInt8MultiArray topic(contains a size of ${amount}KB array)` +
          ` ${times} times.`);

      const time = process.hrtime();
      let node = rclnodejs.createNode('stress_publisher_rclnodejs');
      const publisher = node.createPublisher('std_msgs/msg/UInt8MultiArray', 'stress_topic');
      let sentTimes = 0;
      let totalTimes = parseInt(times, 10);

      setImmediate(() => {
        while (sentTimes++ < totalTimes) {
          publisher.publish(message);
        }
        rclnodejs.shutdown();
        const diff = process.hrtime(time);
        console.log(`Benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds`);
      });

      rclnodejs.spin(node);
    }).catch((err) => {
      console.log(err);
    });

    rl.close();
  });
});