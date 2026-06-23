import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { World } from '../lib/physics/World';
import { Player } from '../lib/physics/Player';
import { Ball } from '../lib/physics/Ball';
import { Vector2 } from '../lib/math/Vector2';

const MAX_JOYSTICK_RADIUS = 80;

type JoystickState = {
  active: boolean;
  id: number | null;
  origin: Vector2;
  current: Vector2;
};

const pathData = "M89.20 108.20Q90.50 108.20 91.25 109.45Q92 110.70 92 112.60L92 112.60Q92 114.90 91.30 116.20Q90.60 117.50 89.10 118.50L89.10 118.50Q83.20 122.40 70.30 131.30L70.30 131.30Q66.40 152 60.20 163.90Q54 175.80 44.50 175.80L44.50 175.80Q39.40 175.80 36.20 172.65Q33 169.50 33 164.40L33 164.40Q33 159.70 35.10 154.90Q37.20 150.10 42.95 143.80Q48.70 137.50 59.20 129.40L59.20 129.40L59.50 127.50Q51.60 130.80 44 130.80L44 130.80Q32.80 130.80 24.30 126.45Q15.80 122.10 11.10 114.10Q6.40 106.10 6.40 95.50L6.40 95.50Q6.40 80.70 12 69.35Q17.60 58.00 27.45 51.75Q37.30 45.50 49.50 45.50L49.50 45.50Q61.20 45.50 67.05 50.95Q72.90 56.40 72.90 65.40L72.90 65.40Q72.90 71.30 70.75 74.85Q68.60 78.40 64.60 78.40L64.60 78.40Q61.90 78.40 60.25 77.10Q58.60 75.80 58.60 73.50L58.60 73.50Q58.60 72.50 59 70.10L59 70.10Q59.60 67.30 59.60 65.70L59.60 65.70Q59.60 61.50 57.05 59.20Q54.50 56.90 48.50 56.90L48.50 56.90Q41.20 56.90 34.95 61.10Q28.70 65.30 24.90 73.65Q21.10 82 21.10 93.70L21.10 93.70Q21.10 105.70 27.65 112.25Q34.20 118.80 46.60 118.80L46.60 118.80Q53.50 118.80 61 115.70L61 115.70L62.40 103.50L52.20 103.50Q49.40 103.50 47.90 102.15Q46.40 100.80 46.40 97.70L46.40 97.70Q46.40 94.90 47.90 93.30Q49.40 91.70 51.90 91.70L51.90 91.70L70.60 91.70Q72.80 91.70 74.25 93.15Q75.70 94.60 75.40 97.30L75.40 97.30Q75.10 100.50 73.40 111.80L73.40 111.80L72.30 119.40Q80.30 113.40 86.90 109.00L86.90 109.00Q88.20 108.20 89.20 108.20L89.20 108.20ZM45.60 166.10Q48.20 166.10 51.30 160.20Q54.40 154.30 57.10 141.20L57.10 141.20Q49.50 147.70 46.15 152.95Q42.80 158.20 42.80 162.20L42.80 162.20Q42.80 166.10 45.60 166.10L45.60 166.10ZM136.90 99.60Q138.20 99.60 138.90 100.90Q139.60 102.20 139.60 104.20L139.60 104.20Q139.60 109.00 136.70 109.90L136.70 109.90Q130.70 112.00 123.50 112.30L123.50 112.30Q121.60 120.70 116 125.75Q110.40 130.80 103.30 130.80L103.30 130.80Q97.30 130.80 93.05 127.90Q88.80 125.00 86.60 120.20Q84.40 115.40 84.40 109.80L84.40 109.80Q84.40 102.20 87.30 96.25Q90.20 90.30 95.30 86.95Q100.40 83.60 106.60 83.60L106.60 83.60Q114.20 83.60 118.85 88.85Q123.50 94.10 124.30 101.80L124.30 101.80Q129 101.50 135.50 99.80L135.50 99.80Q136.30 99.60 136.90 99.60L136.90 99.60ZM104.10 120.20Q107.30 120.20 109.65 117.60Q112.00 115.00 112.80 110.10L112.80 110.10Q109.70 108.00 108.05 104.60Q106.40 101.20 106.40 97.40L106.40 97.40Q106.40 95.80 106.70 94.20L106.70 94.20L106.20 94.20Q102.20 94.20 99.55 98.05Q96.90 101.90 96.90 108.90L96.90 108.90Q96.90 114.40 99.05 117.30Q101.20 120.20 104.10 120.20L104.10 120.20ZM182.00 99.60Q183.30 99.60 184.00 100.90Q184.70 102.20 184.70 104.20L184.70 104.20Q184.70 109.00 181.80 109.90L181.80 109.90Q175.80 112.00 168.60 112.30L168.60 112.30Q166.70 120.70 161.10 125.75Q155.50 130.80 148.40 130.80L148.40 130.80Q142.40 130.80 138.15 127.90Q133.90 125.00 131.70 120.20Q129.50 115.40 129.50 109.80L129.50 109.80Q129.50 102.20 132.40 96.25Q135.30 90.30 140.40 86.95Q145.50 83.60 151.70 83.60L151.70 83.60Q159.30 83.60 163.95 88.85Q168.60 94.10 169.40 101.80L169.40 101.80Q174.10 101.50 180.60 99.80L180.60 99.80Q181.40 99.60 182.00 99.60L182.00 99.60ZM149.20 120.20Q152.40 120.20 154.75 117.60Q157.10 115.00 157.90 110.10L157.90 110.10Q154.80 108.00 153.15 104.60Q151.50 101.20 151.50 97.40L151.50 97.40Q151.50 95.80 151.80 94.20L151.80 94.20L151.30 94.20Q147.30 94.20 144.65 98.05Q142.00 101.90 142.00 108.90L142.00 108.90Q142.00 114.40 144.15 117.30Q146.30 120.20 149.20 120.20L149.20 120.20ZM227.10 99.60Q228.40 99.60 229.10 100.90Q229.80 102.20 229.80 104.20L229.80 104.20Q229.80 109.00 226.90 109.90L226.90 109.90Q220.90 112.00 213.70 112.30L213.70 112.30Q211.80 120.70 206.20 125.75Q200.60 130.80 193.50 130.80L193.50 130.80Q187.50 130.80 183.25 127.90Q179 125.00 176.80 120.20Q174.60 115.40 174.60 109.80L174.60 109.80Q174.60 102.20 177.50 96.25Q180.40 90.30 185.50 86.95Q190.60 83.60 196.80 83.60L196.80 83.60Q204.40 83.60 209.05 88.85Q213.70 94.10 214.50 101.80L214.50 101.80Q219.20 101.50 225.70 99.80L225.70 99.80Q226.50 99.60 227.10 99.60L227.10 99.60ZM194.30 120.20Q197.50 120.20 199.85 117.60Q202.20 115.00 203 110.10L203 110.10Q199.90 108.00 198.25 104.60Q196.60 101.20 196.60 97.40L196.60 97.40Q196.60 95.80 196.90 94.20L196.90 94.20L196.40 94.20Q192.40 94.20 189.75 98.05Q187.10 101.90 187.10 108.90L187.10 108.90Q187.10 114.40 189.25 117.30Q191.40 120.20 194.30 120.20L194.30 120.20ZM272.20 99.60Q273.50 99.60 274.20 100.90Q274.90 102.20 274.90 104.20L274.90 104.20Q274.90 109.00 272 109.90L272 109.90Q266 112.00 258.80 112.30L258.80 112.30Q256.90 120.70 251.30 125.75Q245.70 130.80 238.60 130.80L238.60 130.80Q232.60 130.80 228.35 127.90Q224.10 125.00 221.90 120.20Q219.70 115.40 219.70 109.80L219.70 109.80Q219.70 102.20 222.60 96.25Q225.50 90.30 230.60 86.95Q235.70 83.60 241.90 83.60L241.90 83.60Q249.50 83.60 254.15 88.85Q258.80 94.10 259.60 101.80L259.60 101.80Q264.30 101.50 270.80 99.80L270.80 99.80Q271.60 99.60 272.20 99.60L272.20 99.60ZM239.40 120.20Q242.60 120.20 244.95 117.60Q247.30 115.00 248.10 110.10L248.10 110.10Q245 108.00 243.35 104.60Q241.70 101.20 241.70 97.40L241.70 97.40Q241.70 95.80 242 94.20L242 94.20L241.50 94.20Q237.50 94.20 234.85 98.05Q232.20 101.90 232.20 108.90L232.20 108.90Q232.20 114.40 234.35 117.30Q236.50 120.20 239.40 120.20L239.40 120.20ZM317.30 99.60Q318.60 99.60 319.30 100.90Q320 102.20 320 104.20L320 104.20Q320 109.00 317.10 109.90L317.10 109.90Q311.10 112.00 303.90 112.30L303.90 112.30Q302 120.70 296.40 125.75Q290.80 130.80 283.70 130.80L283.70 130.80Q277.70 130.80 273.45 127.90Q269.20 125.00 267 120.20Q264.80 115.40 264.80 109.80L264.80 109.80Q264.80 102.20 267.70 96.25Q270.60 90.30 275.70 86.95Q280.80 83.60 287 83.60L287 83.60Q294.60 83.60 299.25 88.85Q303.90 94.10 304.70 101.80L304.70 101.80Q309.40 101.50 315.90 99.80L315.90 99.80Q316.70 99.60 317.30 99.60L317.30 99.60ZM284.50 120.20Q287.70 120.20 290.05 117.60Q292.40 115.00 293.20 110.10L293.20 110.10Q290.10 108.00 288.45 104.60Q286.80 101.20 286.80 97.40L286.80 97.40Q286.80 95.80 287.10 94.20L287.10 94.20L286.60 94.20Q282.60 94.20 279.95 98.05Q277.30 101.90 277.30 108.90L277.30 108.90Q277.30 114.40 279.45 117.30Q281.60 120.20 284.50 120.20L284.50 120.20ZM362.40 99.60Q363.70 99.60 364.40 100.90Q365.10 102.20 365.10 104.20L365.10 104.20Q365.10 109.00 362.20 109.90L362.20 109.90Q356.20 112.00 349 112.30L349 112.30Q347.10 120.70 341.50 125.75Q335.90 130.80 328.80 130.80L328.80 130.80Q322.80 130.80 318.55 127.90Q314.30 125.00 312.10 120.20Q309.90 115.40 309.90 109.80L309.90 109.80Q309.90 102.20 312.80 96.25Q315.70 90.30 320.80 86.95Q325.90 83.60 332.10 83.60L332.10 83.60Q339.70 83.60 344.35 88.85Q349 94.10 349.80 101.80L349.80 101.80Q354.50 101.50 361 99.80L361 99.80Q361.80 99.60 362.40 99.60L362.40 99.60ZM329.60 120.20Q332.80 120.20 335.15 117.60Q337.50 115.00 338.30 110.10L338.30 110.10Q335.20 108.00 333.55 104.60Q331.90 101.20 331.90 97.40L331.90 97.40Q331.90 95.80 332.20 94.20L332.20 94.20L331.70 94.20Q327.70 94.20 325.05 98.05Q322.40 101.90 322.40 108.90L322.40 108.90Q322.40 114.40 324.55 117.30Q326.70 120.20 329.60 120.20L329.60 120.20ZM407.50 99.60Q408.80 99.60 409.50 100.90Q410.20 102.20 410.20 104.20L410.20 104.20Q410.20 109.00 407.30 109.90L407.30 109.90Q401.30 112.00 394.10 112.30L394.10 112.30Q392.20 120.70 386.60 125.75Q381.00 130.80 373.90 130.80L373.90 130.80Q367.90 130.80 363.65 127.90Q359.40 125.00 357.20 120.20Q355.00 115.40 355.00 109.80L355.00 109.80Q355.00 102.20 357.90 96.25Q360.80 90.30 365.90 86.95Q371.00 83.60 377.20 83.60L377.20 83.60Q384.80 83.60 389.45 88.85Q394.10 94.10 394.90 101.80L394.90 101.80Q399.60 101.50 406.10 99.80L406.10 99.80Q406.90 99.60 407.50 99.60L407.50 99.60ZM374.70 120.20Q377.90 120.20 380.25 117.60Q382.60 115.00 383.40 110.10L383.40 110.10Q380.30 108.00 378.65 104.60Q377.00 101.20 377.00 97.40L377.00 97.40Q377.00 95.80 377.30 94.20L377.30 94.20L376.80 94.20Q372.80 94.20 370.15 98.05Q367.50 101.90 367.50 108.90L367.50 108.90Q367.50 114.40 369.65 117.30Q371.80 120.20 374.70 120.20L374.70 120.20ZM452.60 99.60Q453.90 99.60 454.60 100.90Q455.30 102.20 455.30 104.20L455.30 104.20Q455.30 109.00 452.40 109.90L452.40 109.90Q446.40 112.00 439.20 112.30L439.20 112.30Q437.30 120.70 431.70 125.75Q426.10 130.80 419.00 130.80L419.00 130.80Q413.00 130.80 408.75 127.90Q404.50 125.00 402.30 120.20Q400.10 115.40 400.10 109.80L400.10 109.80Q400.10 102.20 403.00 96.25Q405.90 90.30 411.00 86.95Q416.10 83.60 422.30 83.60L422.30 83.60Q429.90 83.60 434.55 88.85Q439.20 94.10 440.00 101.80L440.00 101.80Q444.70 101.50 451.20 99.80L451.20 99.80Q452.00 99.60 452.60 99.60L452.60 99.60ZM419.80 120.20Q423.00 120.20 425.35 117.60Q427.70 115.00 428.50 110.10L428.50 110.10Q425.40 108.00 423.75 104.60Q422.10 101.20 422.10 97.40L422.10 97.40Q422.10 95.80 422.40 94.20L422.40 94.20L421.90 94.20Q417.90 94.20 415.25 98.05Q412.60 101.90 412.60 108.90L412.60 108.90Q412.60 114.40 414.75 117.30Q416.90 120.20 419.80 120.20L419.80 120.20ZM497.70 99.60Q499.00 99.60 499.70 100.90Q500.40 102.20 500.40 104.20L500.40 104.20Q500.40 109.00 497.50 109.90L497.50 109.90Q491.50 112.00 484.30 112.30L484.30 112.30Q482.40 120.70 476.80 125.75Q471.20 130.80 464.10 130.80L464.10 130.80Q458.10 130.80 453.85 127.90Q449.60 125.00 447.40 120.20Q445.20 115.40 445.20 109.80L445.20 109.80Q445.20 102.20 448.10 96.25Q451.00 90.30 456.10 86.95Q461.20 83.60 467.40 83.60L467.40 83.60Q475.00 83.60 479.65 88.85Q484.30 94.10 485.10 101.80L485.10 101.80Q489.80 101.50 496.30 99.80L496.30 99.80Q497.10 99.60 497.70 99.60L497.70 99.60ZM464.90 120.20Q468.10 120.20 470.45 117.60Q472.80 115.00 473.60 110.10L473.60 110.10Q470.50 108.00 468.85 104.60Q467.20 101.20 467.20 97.40L467.20 97.40Q467.20 95.80 467.50 94.20L467.50 94.20L467.00 94.20Q463.00 94.20 460.35 98.05Q457.70 101.90 457.70 108.90L457.70 108.90Q457.70 114.40 459.85 117.30Q462.00 120.20 464.90 120.20L464.90 120.20ZM542.80 99.60Q544.10 99.60 544.80 100.90Q545.50 102.20 545.50 104.20L545.50 104.20Q545.50 109.00 542.60 109.90L542.60 109.90Q536.60 112.00 529.40 112.30L529.40 112.30Q527.50 120.70 521.90 125.75Q516.30 130.80 509.20 130.80L509.20 130.80Q503.20 130.80 498.95 127.90Q494.70 125.00 492.50 120.20Q490.30 115.40 490.30 109.80L490.30 109.80Q490.30 102.20 493.20 96.25Q496.10 90.30 501.20 86.95Q506.30 83.60 512.50 83.60L512.50 83.60Q520.10 83.60 524.75 88.85Q529.40 94.10 530.20 101.80L530.20 101.80Q534.90 101.50 541.40 99.80L541.40 99.80Q542.20 99.60 542.80 99.60L542.80 99.60ZM510.00 120.20Q513.20 120.20 515.55 117.60Q517.90 115.00 518.70 110.10L518.70 110.10Q515.60 108.00 513.95 104.60Q512.30 101.20 512.30 97.40L512.30 97.40Q512.30 95.80 512.60 94.20L512.60 94.20L512.10 94.20Q508.10 94.20 505.45 98.05Q502.80 101.90 502.80 108.90L502.80 108.90Q502.80 114.40 504.95 117.30Q507.10 120.20 510.00 120.20L510.00 120.20ZM587.90 99.60Q589.20 99.60 589.90 100.90Q590.60 102.20 590.60 104.20L590.60 104.20Q590.60 109.00 587.70 109.90L587.70 109.90Q581.70 112.00 574.50 112.30L574.50 112.30Q572.60 120.70 567.00 125.75Q561.40 130.80 554.30 130.80L554.30 130.80Q548.30 130.80 544.05 127.90Q539.80 125.00 537.60 120.20Q535.40 115.40 535.40 109.80L535.40 109.80Q535.40 102.20 538.30 96.25Q541.20 90.30 546.30 86.95Q551.40 83.60 557.60 83.60L557.60 83.60Q565.20 83.60 569.85 88.85Q574.50 94.10 575.30 101.80L575.30 101.80Q580.00 101.50 586.50 99.80L586.50 99.80Q587.30 99.60 587.90 99.60L587.90 99.60ZM555.10 120.20Q558.30 120.20 560.65 117.60Q563.00 115.00 563.80 110.10L563.80 110.10Q560.70 108.00 559.05 104.60Q557.40 101.20 557.40 97.40L557.40 97.40Q557.40 95.80 557.70 94.20L557.70 94.20L557.20 94.20Q553.20 94.20 550.55 98.05Q547.90 101.90 547.90 108.90L547.90 108.90Q547.90 114.40 550.05 117.30Q552.20 120.20 555.10 120.20L555.10 120.20ZM594.30 130.80Q588.10 130.80 584.40 126.30Q580.70 121.80 580.70 114.50L580.70 114.50Q580.70 106.50 584.40 99.35Q588.10 92.20 594.25 87.85Q600.40 83.50 607.30 83.50L607.30 83.50Q609.50 83.50 610.25 84.35Q611.00 85.20 611.50 87.40L611.50 87.40Q613.60 87 615.90 87L615.90 87Q620.80 87 620.80 90.50L620.80 90.50Q620.80 92.60 619.30 100.50L619.30 100.50Q617.00 112.00 617.00 116.50L617.00 116.50Q617.00 118.00 617.75 118.90Q618.50 119.80 619.70 119.80L619.70 119.80Q621.60 119.80 624.30 117.35Q627.00 114.90 631.60 109.40L631.60 109.40Q632.80 108.00 634.30 108.00L634.30 108.00Q635.60 108.00 636.35 109.20Q637.10 110.40 637.10 112.50L637.10 112.50Q637.10 116.50 635.20 118.70L635.20 118.70Q631.10 123.80 626.50 127.30Q621.90 130.80 617.60 130.80L617.60 130.80Q614.30 130.80 611.55 128.55Q608.80 126.30 607.40 122.40L607.40 122.40Q602.20 130.80 594.30 130.80L594.30 130.80ZM597.90 120.70Q600.10 120.70 602.10 118.10Q604.10 115.50 605.00 111.20L605.00 111.20L608.70 92.80Q604.50 92.90 600.95 95.95Q597.40 99.00 595.30 104.00Q593.20 109.00 593.20 114.60L593.20 114.60Q593.20 117.70 594.45 119.20Q595.70 120.70 597.90 120.70L597.90 120.70ZM666.90 108.00Q668.20 108.00 668.95 109.20Q669.70 110.40 669.70 112.50L669.70 112.50Q669.70 116.50 667.80 118.70L667.80 118.70Q663.50 124.00 658.45 127.40Q653.40 130.80 647.00 130.80L647.00 130.80Q638.20 130.80 633.95 122.80Q629.70 114.80 629.70 102.10L629.70 102.10Q629.70 89.90 632.85 74.30Q636.00 58.70 642.15 47.50Q648.30 36.30 656.80 36.30L656.80 36.30Q661.60 36.30 664.35 40.75Q667.10 45.20 667.10 53.50L667.10 53.50Q667.10 65.40 660.50 81.10Q653.90 96.80 642.60 112.20L642.60 112.20Q643.30 116.30 644.90 118.05Q646.50 119.80 649.10 119.80L649.10 119.80Q653.20 119.80 656.30 117.45Q659.40 115.10 664.20 109.40L664.20 109.40Q665.40 108.00 666.90 108.00L666.90 108.00ZM654.60 46.20Q652.30 46.20 649.40 54.50Q646.50 62.80 644.30 75.10Q642.10 87.40 641.90 98.70L641.90 98.70Q649.00 87 653.20 75.25Q657.40 63.50 657.40 53.80L657.40 53.80Q657.40 46.20 654.60 46.20L654.60 46.20ZM686.80 106.90Q684.80 106.90 683.50 106.00Q682.20 105.10 682.20 103.20L682.20 103.20L682.30 102.40Q684.00 91.20 686.90 76.90Q689.80 62.60 692.30 52.20L692.30 52.20Q693.90 45.80 701.00 45.80L701.00 45.80Q707.40 45.80 707.40 49.90L707.40 49.90Q707.40 50.80 707.10 51.90L707.10 51.90Q704.50 62.50 700.20 77.55Q695.90 92.60 692.00 103.70L692.00 103.70Q690.90 106.90 686.80 106.90L686.80 106.90ZM683.00 130.80Q678.60 130.80 676.35 128.40Q674.10 126.00 674.10 122.10L674.10 122.10Q674.10 117.60 676.65 114.90Q679.20 112.20 683.80 112.20L683.80 112.20Q688.20 112.20 690.45 114.35Q692.70 116.50 692.70 120.70L692.70 120.70Q692.70 125.30 690.10 128.05Q687.50 130.80 683.00 130.80L683.00 130.80Z";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
};

const Sandbox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const worldRef = useRef<World | null>(null);
  const requestRef = useRef<number>();
  const activePlayerRef = useRef<Player | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const maxDashes = 5;
  const dashesRef = useRef<number>(maxDashes);
  const dashProgressRef = useRef<number>(1);
  const lastTimeRef = useRef<number>(0);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [score, setScore] = useState({ team0: 0, team1: 0 });
  const [showGoalOverlay, setShowGoalOverlay] = useState(false);
  const isResettingRef = useRef(false);
  const grassTuftsRef = useRef<{x: number, y: number, type: number}[]>([]);

  const joystickRef = useRef<JoystickState>({ active: false, id: null, origin: new Vector2(0,0), current: new Vector2(0,0) });
  const joystickBaseUiRef = useRef<HTMLDivElement>(null);
  const joystickHandleUiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: clientWidth,
        height: clientHeight,
      });
      if (worldRef.current) {
        worldRef.current.width = clientWidth;
        worldRef.current.height = clientHeight;
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  const initWorld = useCallback((possessionTeamId: number = 0) => {
    const w = dimensionsRef.current.width;
    const h = dimensionsRef.current.height;
    if (w === 0 || h === 0) return;

    const isPortrait = h > w;
    const u = isPortrait ? w / 68 : h / 68;
    const physicalGoalWidth = 7.32 * u;

    // Generate static grass tufts
    grassTuftsRef.current = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      type: Math.floor(Math.random() * 3) // 3 variations of tufts
    }));

    const world = new World(w, h);
    
    // Commented out particle collision system as we will revisit this later
    // world.onCollision = (pos, intensity) => {
    //     const numParticles = Math.min(10, Math.floor(intensity * 2));
    //     for (let i = 0; i < numParticles; i++) {
    //         particlesRef.current.push({
    //             x: pos.x,
    //             y: pos.y,
    //             vx: (Math.random() - 0.5) * intensity * 3,
    //             vy: (Math.random() - 0.5) * intensity * 3,
    //             life: 1.0,
    //             decay: 0.05 + Math.random() * 0.05,
    //             color: Math.random() > 0.5 ? '#cbd5e1' : '#f8fafc'
    //         });
    //     }
    // };

    world.setGoalConfig(physicalGoalWidth, isPortrait, (teamScoredId: number) => {
        if (isResettingRef.current) return;
        isResettingRef.current = true;
        
        setShowGoalOverlay(true);

        setScore(s => ({
            ...s,
            [teamScoredId === 0 ? 'team0' : 'team1']: s[teamScoredId === 0 ? 'team0' : 'team1'] + 1
        }));

        // The team that was scored ON gets possession
        const scoredOnTeam = teamScoredId === 0 ? 1 : 0;
        
        setTimeout(() => {
            initWorld(scoredOnTeam);
            isResettingRef.current = false;
            setShowGoalOverlay(false);
        }, 3000);
    });

    // Add a Ball
    const ball = new Ball({ x: w / 2, y: h / 2, radius: 10, mass: 0.5, color: '#111827' });
    world.addEntity(ball);

    if (isPortrait) {
        // Teams 0 (Bottom) & 1 (Top)
        const t0KickoffY = possessionTeamId === 0 ? h / 2 + 50 : h - 200;
        const t1KickoffY = possessionTeamId === 1 ? h / 2 - 50 : 200;

        const p1 = new Player({ id: "p1", x: w / 2, y: t0KickoffY, radius: 16, mass: 1.5, color: '#2563eb', team: 0, isActive: true, maxSpeed: 4 });
        world.addEntity(p1);
        activePlayerRef.current = p1;

        world.addEntity(new Player({ x: w / 2 - 100, y: h - 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 3.5 }));
        world.addEntity(new Player({ x: w / 2 + 100, y: h - 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 3.5 }));

        const p2 = new Player({ id: "p2", x: w / 2, y: t1KickoffY, radius: 16, mass: 1.5, color: '#dc2626', team: 1, isActive: false, maxSpeed: 4 });
        world.addEntity(p2);

        for (let i=0; i<2; i++) {
          world.addEntity(new Player({ 
            x: w / 2 + (i === 0 ? -100 : 100), 
            y: 150, 
            radius: 16, 
            mass: 1.5, 
            color: '#dc2626', 
            team: 1, 
            maxSpeed: 3.5 
          }));
        }
    } else {
        // Teams 0 (Left) & 1 (Right)
        const t0KickoffX = possessionTeamId === 0 ? w / 2 - 50 : 200;
        const t1KickoffX = possessionTeamId === 1 ? w / 2 + 50 : w - 200;

        const p1 = new Player({ id: "p1", x: t0KickoffX, y: h / 2, radius: 16, mass: 1.5, color: '#2563eb', team: 0, isActive: true, maxSpeed: 4 });
        world.addEntity(p1);
        activePlayerRef.current = p1;

        world.addEntity(new Player({ x: 150, y: h / 2 - 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 3.5 }));
        world.addEntity(new Player({ x: 150, y: h / 2 + 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 3.5 }));

        const p2 = new Player({ id: "p2", x: t1KickoffX, y: h / 2, radius: 16, mass: 1.5, color: '#dc2626', team: 1, isActive: false, maxSpeed: 4 });
        world.addEntity(p2);

        for (let i=0; i<2; i++) {
          world.addEntity(new Player({ 
            x: w - 150, 
            y: h / 2 + (i === 0 ? -150 : 150), 
            radius: 16, 
            mass: 1.5, 
            color: '#dc2626', 
            team: 1, 
            maxSpeed: 3.5 
          }));
        }
    }

    worldRef.current = world;
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && !worldRef.current) {
        initWorld(0);
    }
  }, [dimensions.width, dimensions.height, initWorld]);

  useEffect(() => {
        const render = (time: number) => {
        if (!worldRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaMs = time - lastTimeRef.current;
        lastTimeRef.current = time;

        const w = canvasRef.current.clientWidth;
        const h = canvasRef.current.clientHeight;

        // Auto-switch active player to the teammate closest to the ball
        const ball = worldRef.current.entities.find(e => e instanceof Ball) as Ball | undefined;
        const isPortrait = h > w;
        
        const scaleU = isPortrait ? w / 68 : h / 68;
        const boxW = 40.32 * scaleU;
        const boxH = 16.5 * scaleU;
        
        const inPenaltyBox = (pos: Vector2) => {
            if (isPortrait) {
                const inX = pos.x > (w - boxW) / 2 && pos.x < (w + boxW) / 2;
                const inBot = pos.y > h - boxH;
                const inTop = pos.y < boxH;
                return inX && (inBot || inTop);
            } else {
                const inY = pos.y > (h - boxW) / 2 && pos.y < (h + boxW) / 2;
                const inLeft = pos.x < boxH;
                const inRight = pos.x > w - boxH;
                return inY && (inLeft || inRight);
            }
        };

        const clampToPenaltyBoxEdge = (pos: Vector2) => {
            if (!inPenaltyBox(pos)) return pos;
            const newPos = new Vector2(pos.x, pos.y);
            if (isPortrait) {
                const leftDiff = Math.abs(pos.x - (w - boxW) / 2);
                const rightDiff = Math.abs(pos.x - (w + boxW) / 2);
                if (pos.y < h / 2) {
                    const bottomDiff = Math.abs(pos.y - boxH);
                    const min = Math.min(leftDiff, rightDiff, bottomDiff);
                    if (min === bottomDiff) newPos.y = boxH;
                    else if (min === leftDiff) newPos.x = (w - boxW) / 2;
                    else newPos.x = (w + boxW) / 2;
                } else {
                    const topDiff = Math.abs(pos.y - (h - boxH));
                    const min = Math.min(leftDiff, rightDiff, topDiff);
                    if (min === topDiff) newPos.y = h - boxH;
                    else if (min === leftDiff) newPos.x = (w - boxW) / 2;
                    else newPos.x = (w + boxW) / 2;
                }
            } else {
                const topDiff = Math.abs(pos.y - (h - boxW) / 2);
                const botDiff = Math.abs(pos.y - (h + boxW) / 2);
                if (pos.x < w / 2) {
                    const rightDiff = Math.abs(pos.x - boxH);
                    const min = Math.min(topDiff, botDiff, rightDiff);
                    if (min === rightDiff) newPos.x = boxH;
                    else if (min === topDiff) newPos.y = (h - boxW) / 2;
                    else newPos.y = (h + boxW) / 2;
                } else {
                    const leftDiff = Math.abs(pos.x - (w - boxH));
                    const min = Math.min(topDiff, botDiff, leftDiff);
                    if (min === leftDiff) newPos.x = w - boxH;
                    else if (min === topDiff) newPos.y = (h - boxW) / 2;
                    else newPos.y = (h + boxW) / 2;
                }
            }
            return newPos;
        };
        
        if (ball) {
            let closestDstSq = Infinity;
            let closestTeammate: Player | null = null;
            
            let closestDstSqT1 = Infinity;
            let closestT1: Player | null = null;
            
            for (const entity of worldRef.current.entities) {
                if (entity instanceof Player) {
                    const dstSq = entity.pos.sub(ball.pos).magSq();
                    if (entity.team === 0) {
                        if (dstSq < closestDstSq) {
                            closestDstSq = dstSq;
                            closestTeammate = entity;
                        }
                    } else if (entity.team === 1) {
                        if (dstSq < closestDstSqT1) {
                            closestDstSqT1 = dstSq;
                            closestT1 = entity;
                        }
                    }
                }
            }

            if (closestTeammate && closestTeammate !== activePlayerRef.current) {
                if (activePlayerRef.current) activePlayerRef.current.isActive = false;
                closestTeammate.isActive = true;
                activePlayerRef.current = closestTeammate;
            }

            // AI Logic
            for (const entity of worldRef.current.entities) {
                if (entity instanceof Player && entity !== activePlayerRef.current) {
                    let targetPos = entity.pos;
                    let speed = 0;
                    
                    if (entity.team === 1) {
                        // AI Opponent
                        const ownGoalCenter = isPortrait ? new Vector2(w/2, 0) : new Vector2(w, h/2);
                        const targetGoalCenter = isPortrait ? new Vector2(w/2, h) : new Vector2(0, h/2);

                        if (entity === closestT1) {
                            // Chase ball, but try to approach from the side that pushes it toward the target goal
                            const toTargetGoal = targetGoalCenter.sub(ball.pos).normalize();
                            // Position to aim for is slightly "behind" the ball relative to the goal
                            const approachPos = ball.pos.sub(toTargetGoal.mult(20));
                            
                            // If we are relatively "behind" the ball already, we can just push directly through it
                            const toBall = ball.pos.sub(entity.pos).normalize();
                            const angleSimilarity = toBall.dot(toTargetGoal);

                            if (angleSimilarity > 0.5) {
                                // We're behind it, push through to goal
                                targetPos = ball.pos.add(toTargetGoal.mult(20));

                                // AI dash/shoot mechanic
                                const distSq = entity.pos.sub(ball.pos).magSq();
                                if (distSq < 4800 && Math.random() < 0.05) { // Roughly 70px away
                                    entity.applyForce(toBall.mult(60));
                                }
                            } else {
                                // We are on the wrong side, run to the approach pos
                                targetPos = approachPos;
                            }
                            
                            speed = 1.0; 
                        } else {
                            // Support/Defend
                            // Stay further back, covering the goal side
                            targetPos = ball.pos.add(ownGoalCenter.mult(2)).div(3);
                            
                            // Spread out slightly
                            if (isPortrait) {
                                targetPos.x = entity.pos.x * 0.8 + (w/2) * 0.2;
                            } else {
                                targetPos.y = entity.pos.y * 0.8 + (h/2) * 0.2;
                            }
                            speed = 0.7;
                        }
                    } else if (entity.team === 0) {
                        // Teammate AI
                        const opponentGoalCenter = isPortrait ? new Vector2(w/2, 0) : new Vector2(w, h/2);
                        const ownGoalCenter = isPortrait ? new Vector2(w/2, h) : new Vector2(0, h/2);
                        
                        // If ball is close to our goal, defend. Otherwise, push forward
                        const distToOurGoal = ball.pos.sub(ownGoalCenter).mag();
                        
                        if (distToOurGoal < (isPortrait ? h/3 : w/3)) {
                            // Defend
                            targetPos = ball.pos.add(ownGoalCenter).div(2);
                        } else {
                            // Attack / Wing support
                            targetPos = ball.pos.add(opponentGoalCenter).div(2);
                            // Spread out to wings
                            if (isPortrait) {
                                const wingX = entity.pos.x < w/2 ? w/4 : (w*3)/4;
                                targetPos.x = targetPos.x * 0.3 + wingX * 0.7;
                            } else {
                                const wingY = entity.pos.y < h/2 ? h/4 : (h*3)/4;
                                targetPos.y = targetPos.y * 0.3 + wingY * 0.7;
                            }
                        }
                        
                        speed = 0.8;
                    }
                    
                    // Restrict non-primary AI from entering the penalty boxes
                    // so there is only one AI per team allowed in the 18-yard box.
                    if ((entity.team === 1 && entity !== closestT1) || (entity.team === 0)) {
                        // All non-primary players stay out, including teammates since user controls one Primary
                        targetPos = clampToPenaltyBoxEdge(targetPos);
                    }
                    
                    const dir = targetPos.sub(entity.pos);
                    // Move if not super close to target
                    if (dir.magSq() > 400) {
                        entity.applyForce(dir.normalize().mult(speed));
                    }
                }
            }
        }

        // Apply input force
        if (joystickRef.current.active && activePlayerRef.current) {
            const jDir = joystickRef.current.current.sub(joystickRef.current.origin);
            if (jDir.magSq() > 0.01) {
                // limit input vector to max joystick radius
                const limitedDir = jDir.mag() > MAX_JOYSTICK_RADIUS ? jDir.normalize().mult(MAX_JOYSTICK_RADIUS) : jDir;
                // apply scaled force
                activePlayerRef.current.applyForce(limitedDir.mult(0.015));
            }
        }

        // Tick Physics independently of draw if we wanted, but here they run in sequence per frame.
        worldRef.current.tick(16); // Target dt in ms ~16.6ms for 60fps

        // Fully clear the physical canvas first to avoid any smearing
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.save();
        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        // Draw Background
        ctx.fillStyle = '#f4f4f0'; // Off-white hand-drawn paper look
        ctx.fillRect(0, 0, w, h);

        // Draw Grass Tufts
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)'; // faint grayish
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        grassTuftsRef.current.forEach(tuft => {
            ctx.beginPath();
            if (tuft.type === 0) {
                // cross
                ctx.moveTo(tuft.x - 3, tuft.y);
                ctx.lineTo(tuft.x + 3, tuft.y);
                ctx.moveTo(tuft.x, tuft.y - 3);
                ctx.lineTo(tuft.x, tuft.y + 3);
            } else if (tuft.type === 1) {
                // diagonal dash
                ctx.moveTo(tuft.x - 3, tuft.y + 3);
                ctx.lineTo(tuft.x + 2, tuft.y - 2);
            } else {
                // v-shape (little grass blade)
                ctx.moveTo(tuft.x - 2, tuft.y - 3);
                ctx.lineTo(tuft.x, tuft.y + 2);
                ctx.lineTo(tuft.x + 3, tuft.y - 1);
            }
            ctx.stroke();
        });

        // Draw Field Markings
        ctx.strokeStyle = '#cbd5e1'; // Raw pencil/marker grayish light
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        
        // Base unit: the field's short side represents 68 meters.
        const u = isPortrait ? w / 68 : h / 68;

        if (isPortrait) {
            // Draw Portrait Field (Vertical play)
            // Center Line (horizontal)
            ctx.beginPath();
            ctx.moveTo(-10, h / 2);
            ctx.lineTo(w + 10, h / 2);
            ctx.stroke();

            // Center Circle
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 9.15 * u, 0, Math.PI * 2);
            ctx.stroke();
            
            // Center Dot
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.max(3, 0.4 * u), 0, Math.PI * 2);
            ctx.fillStyle = '#cbd5e1';
            ctx.fill();

            // Penalty Boxes (40.32m wide x 16.5m deep)
            const penBoxW = 40.32 * u;
            const penBoxH = 16.5 * u;
            ctx.strokeRect((w - penBoxW) / 2, -10, penBoxW, penBoxH + 10); // Top
            ctx.strokeRect((w - penBoxW) / 2, h - penBoxH, penBoxW, penBoxH + 10); // Bottom

            // Goal Areas (18.32m wide x 5.5m deep)
            const goalAreaW = 18.32 * u;
            const goalAreaH = 5.5 * u;
            ctx.strokeRect((w - goalAreaW) / 2, -10, goalAreaW, goalAreaH + 10);
            ctx.strokeRect((w - goalAreaW) / 2, h - goalAreaH, goalAreaW, goalAreaH + 10);

            // Penalty Spots (11m from goal line)
            const penSpotDist = 11 * u;
            ctx.beginPath(); ctx.arc(w / 2, penSpotDist, Math.max(2, 0.3 * u), 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(w / 2, h - penSpotDist, Math.max(2, 0.3 * u), 0, Math.PI * 2); ctx.fill();

            // Penalty Arcs
            const arcRadius = 9.15 * u;
            const arcAngle = Math.acos(5.5 / 9.15); // angle from center to intersect pen box
            // Top arc
            ctx.beginPath();
            ctx.arc(w / 2, penSpotDist, arcRadius, Math.PI/2 - arcAngle, Math.PI/2 + arcAngle);
            ctx.stroke();
            // Bottom arc
            ctx.beginPath();
            ctx.arc(w / 2, h - penSpotDist, arcRadius, -Math.PI/2 - arcAngle, -Math.PI/2 + arcAngle);
            ctx.stroke();

            // Corner Arcs
            const cornerRadius = Math.max(4, 1 * u);
            ctx.beginPath(); ctx.arc(0, 0, cornerRadius, 0, Math.PI/2); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, 0, cornerRadius, Math.PI/2, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, h, cornerRadius, -Math.PI/2, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, h, cornerRadius, Math.PI, Math.PI*1.5); ctx.stroke();

            // Goals representation
            const goalDepth = 2.44 * u;
            const goalWidth = 7.32 * u;
            ctx.fillStyle = 'rgba(203, 213, 225, 0.2)';
            ctx.fillRect((w - goalWidth) / 2, 0, goalWidth, goalDepth);
            ctx.fillRect((w - goalWidth) / 2, h - goalDepth, goalWidth, goalDepth);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect((w - goalWidth) / 2, -2, goalWidth, 4);
            ctx.fillRect((w - goalWidth) / 2, h - 2, goalWidth, 4);

        } else {
            // Draw Landscape Field (Horizontal play)
            // Center Line (vertical)
            ctx.beginPath();
            ctx.moveTo(w / 2, -10);
            ctx.lineTo(w / 2, h + 10);
            ctx.stroke();

            // Center Circle (Radius 9.15m)
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 9.15 * u, 0, Math.PI * 2);
            ctx.stroke();
            
            // Center Dot
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.max(3, 0.4 * u), 0, Math.PI * 2);
            ctx.fillStyle = '#cbd5e1';
            ctx.fill();

            // Penalty Boxes (16.5m x 40.32m)
            const penBoxW = 16.5 * u;
            const penBoxH = 40.32 * u;
            ctx.strokeRect(-10, (h - penBoxH) / 2, penBoxW + 10, penBoxH);
            ctx.strokeRect(w - penBoxW, (h - penBoxH) / 2, penBoxW + 10, penBoxH);

            // Goal Areas (5.5m x 18.32m)
            const goalAreaW = 5.5 * u;
            const goalAreaH = 18.32 * u;
            ctx.strokeRect(-10, (h - goalAreaH) / 2, goalAreaW + 10, goalAreaH);
            ctx.strokeRect(w - goalAreaW, (h - goalAreaH) / 2, goalAreaW + 10, goalAreaH);

            // Penalty Spots (11m from goal line)
            const penSpotDist = 11 * u;
            ctx.beginPath();
            ctx.arc(penSpotDist, h / 2, Math.max(2, 0.3 * u), 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w - penSpotDist, h / 2, Math.max(2, 0.3 * u), 0, Math.PI * 2);
            ctx.fill();

            // Penalty Arcs (Radius 9.15m from penalty spot)
            const arcRadius = 9.15 * u;
            const arcAngle = Math.acos(5.5 / 9.15);
            ctx.beginPath();
            ctx.arc(penSpotDist, h / 2, arcRadius, -arcAngle, arcAngle);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(w - penSpotDist, h / 2, arcRadius, Math.PI - arcAngle, Math.PI + arcAngle);
            ctx.stroke();

            // Corner Arcs (Radius 1m)
            const cornerRadius = Math.max(4, 1 * u);
            ctx.beginPath(); ctx.arc(0, 0, cornerRadius, 0, Math.PI/2); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, h, cornerRadius, -Math.PI/2, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, 0, cornerRadius, Math.PI/2, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, h, cornerRadius, Math.PI, Math.PI*1.5); ctx.stroke();

            // Goals representation
            const goalDepth = 2.44 * u;
            const goalWidth = 7.32 * u;
            ctx.fillStyle = 'rgba(203, 213, 225, 0.2)'; // Faint gray for net area
            ctx.fillRect(0, (h - goalWidth) / 2, goalDepth, goalWidth);
            ctx.fillRect(w - goalDepth, (h - goalWidth) / 2, goalDepth, goalWidth);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-2, (h - goalWidth) / 2, 4, goalWidth);
            ctx.fillRect(w - 2, (h - goalWidth) / 2, 4, goalWidth);
        }

        // Update & Render Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                particlesRef.current.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.life * 3.5), 0, Math.PI * 2);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Render Entities
        for (const entity of worldRef.current.entities) {
            
            if (entity instanceof Ball) {
                // Ball: simple filled black circle
                ctx.beginPath();
                ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#111827';
                ctx.fill();
            } else if (entity instanceof Player) {
                const speed = entity.vel.mag();
                
                // Draw feet if moving
                if (speed > 0.05) {
                   const time = performance.now() / 150 * (speed * 0.8);
                   const offsetMax = 12;
                   const swing1 = Math.sin(time) * offsetMax;
                   const swing2 = Math.sin(time + Math.PI) * offsetMax;
                   
                   const dir = entity.vel.normalize();
                   const perp = new Vector2(-dir.y, dir.x);
                   
                   // Push feet out further and slightly forward so they peek out from under the body
                   const foot1 = entity.pos.add(perp.mult(13)).add(dir.mult(swing1 + 4));
                   const foot2 = entity.pos.add(perp.mult(-13)).add(dir.mult(swing2 + 4));

                   ctx.fillStyle = entity.color;
                   ctx.strokeStyle = '#111827';
                   ctx.lineWidth = 2.5;

                   ctx.beginPath();
                   ctx.arc(foot1.x, foot1.y, 6.5, 0, Math.PI * 2);
                   ctx.fill();
                   ctx.stroke();

                   ctx.beginPath();
                   ctx.arc(foot2.x, foot2.y, 6.5, 0, Math.PI * 2);
                   ctx.fill();
                   ctx.stroke();
                }

                // Player body: thick stroked circle with inset color fill
                ctx.beginPath();
                ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
                ctx.fillStyle = entity.color;
                ctx.fill();
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Ring for active player showing dashes
            if (entity instanceof Player && entity.isActive) {
                const segments = maxDashes;
                const gap = 0.25; // radians gap between segments
                const arcLen = (Math.PI * 2) / segments - gap;
                const radius = entity.radius + 12;

                ctx.lineWidth = 4;
                ctx.lineCap = 'round';

                for (let i = 0; i < segments; i++) {
                    const startAngle = i * (arcLen + gap) - Math.PI / 2;
                    
                    // Background track segment
                    ctx.beginPath();
                    ctx.arc(entity.pos.x, entity.pos.y, radius, startAngle, startAngle + arcLen);
                    ctx.strokeStyle = 'rgba(17, 24, 39, 0.15)'; // faint dark trace
                    ctx.stroke();

                    // Filled dash segment
                    let fillRatio = 0;
                    if (i < dashesRef.current) {
                        fillRatio = 1;
                    } else if (i === dashesRef.current) {
                        fillRatio = dashProgressRef.current;
                    }

                    if (fillRatio > 0) {
                        ctx.beginPath();
                        ctx.arc(entity.pos.x, entity.pos.y, radius, startAngle, startAngle + arcLen * fillRatio);
                        ctx.strokeStyle = '#22c55e'; // Green active
                        ctx.stroke();
                    }
                }
            }
        }

        // Update Joystick DOM overlay
        if (joystickBaseUiRef.current && joystickHandleUiRef.current) {
            if (joystickRef.current.active) {
                joystickBaseUiRef.current.style.opacity = '1';
                joystickBaseUiRef.current.style.left = `${joystickRef.current.origin.x - 96}px`; // 192px width / 2
                joystickBaseUiRef.current.style.top = `${joystickRef.current.origin.y - 96}px`;
                
                const offset = joystickRef.current.current.sub(joystickRef.current.origin);
                if (offset.mag() > MAX_JOYSTICK_RADIUS) {
                    const limited = offset.normalize().mult(MAX_JOYSTICK_RADIUS);
                    joystickHandleUiRef.current.style.transform = `translate(${limited.x}px, ${limited.y}px)`;
                } else {
                    joystickHandleUiRef.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
                }
            } else {
                joystickBaseUiRef.current.style.opacity = '0';
            }
        }
        
        ctx.restore();

        // Handle dash replenish timer
        if (dashesRef.current < maxDashes) {
            dashProgressRef.current += deltaMs / 1000; // 1 second to replenish
            if (dashProgressRef.current >= 1) {
                const surplus = Math.floor(dashProgressRef.current);
                dashesRef.current = Math.min(maxDashes, dashesRef.current + surplus);
                dashProgressRef.current -= surplus;
                if (dashesRef.current >= maxDashes) {
                    dashProgressRef.current = 1;
                }
            }
        } else {
            dashProgressRef.current = 1;
        }

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    
    return () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary buttons or touches
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < dimensions.width / 2) {
        // Activate joystick on left screen half
        joystickRef.current = {
            active: true,
            id: e.pointerId,
            origin: new Vector2(x, y),
            current: new Vector2(x, y)
        };
        try {
            // Capture pointer to track outside canvas optionally
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
            console.warn('Pointer capture failed', err);
        }
    } else {
        // Right screen half -> simulated "Flick" event (dash/shot)
        if (activePlayerRef.current && worldRef.current) {
            // Check dashes
            if (dashesRef.current > 0) {
                const ball = worldRef.current.entities.find(e => e instanceof Ball) as Ball | undefined;
                if (ball) {
                    const player = activePlayerRef.current;
                    const dirToBall = ball.pos.sub(player.pos);
                    // Only normalize and apply if there is a distance
                    if (dirToBall.mag() > 0) {
                        dashesRef.current -= 1;
                        if (dashProgressRef.current === 1) dashProgressRef.current = 0; // reset progress when consuming full max
                        
                        const dashVec = dirToBall.normalize();
                        player.applyForce(dashVec.mult(60)); // Slowed down from 150
                    }
                }
            }
        }
    }
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
      if (joystickRef.current.active && e.pointerId === joystickRef.current.id) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          joystickRef.current.current = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      }
  }
  
  const handlePointerUp = (e: React.PointerEvent) => {
      if (joystickRef.current.active && e.pointerId === joystickRef.current.id) {
          joystickRef.current.active = false;
          joystickRef.current.id = null;
          try {
              e.currentTarget.releasePointerCapture(e.pointerId);
          } catch (err) {}
      }
  }

  return (
    <div className="relative w-full h-screen bg-[#f4f4f0] text-[#111827] flex flex-col overflow-hidden font-sans select-none border-8 border-[#111827]">
      
      {/* Minimal Top-Center Scoreboard */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-6 bg-white border-4 border-[#111827] px-8 py-3 rounded-2xl shadow-[4px_4px_0_0_#111827]">
          <div className="text-2xl font-bold text-blue-600 tracking-wider">USA</div>
          <div className="text-3xl font-black">{score.team0}<span className="mx-2 text-gray-400">:</span>{score.team1}</div>
          <div className="text-2xl font-bold text-red-600 tracking-wider">ARG</div>
        </div>
        <div className="mt-4 bg-white border-4 border-[#111827] shadow-[4px_4px_0_0_#111827] px-6 py-1 rounded-full text-2xl font-bold">
          74:22
        </div>
      </div>

      <main ref={containerRef} className="flex-1 relative flex overflow-hidden">
        {/* The canvas handles physics rendering entirely */}
        <canvas
          ref={canvasRef}
          width={dimensions.width * (window.devicePixelRatio || 1)}
          height={dimensions.height * (window.devicePixelRatio || 1)}
          style={{ width: dimensions.width, height: dimensions.height }}
          className="absolute inset-0 block touch-none z-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        
        {/* Virtual Joystick UI Overlay */}
        <div 
          ref={joystickBaseUiRef} 
          className="absolute w-48 h-48 rounded-full border-4 border-[#111827] border-dashed flex items-center justify-center pointer-events-none transition-opacity duration-150 z-10"
          style={{ opacity: 0 }}
        >
          <div 
            ref={joystickHandleUiRef} 
            className="w-16 h-16 rounded-full bg-black/10 border-4 border-[#111827] transition-transform duration-75"
          ></div>
        </div>
        
        {/* "Flick" zone visual indicator (right side) */}
        <div className="absolute bottom-12 right-12 flex flex-col items-center justify-center pointer-events-none z-10 w-28 h-28 bg-white rounded-full border-4 border-[#111827] shadow-[4px_4px_0_0_#111827] opacity-90">
            <span className="text-2xl font-black text-[#111827] tracking-tighter">FLICK</span>
        </div>

        <AnimatePresence>
          {showGoalOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/20 backdrop-blur-sm"
            >
              <svg viewBox="0 0 715 200" className="w-full max-w-4xl drop-shadow-2xl px-8">
                {/* Transparent handwritten text path staggered by segment */}
                {pathData.split('ZM').map((segment, index, array) => {
                  const d = (index === 0 ? '' : 'M') + segment + (segment.endsWith('Z') ? '' : 'Z');
                  return (
                    <motion.path
                      key={index}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={d}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeInOut" }}
                    />
                  );
                })}
                {/* Solid version underneath to fade in for effect */}
                <motion.path
                  fill="#fbbf24"
                  stroke="none"
                  d={pathData}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Sandbox;
