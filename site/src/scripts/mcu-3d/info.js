// 每个模块的讲解：是什么 / 做什么 / 怎么用
// 依据《STM32中文参考手册V10》与《STM32教程（HAL版）_讲义》

export const INFO = {
  core: {
    what: 'Cortex-M3 是 32 位 RISC 处理器内核，内部包含取指、译码、执行单元和 NVIC 中断控制器。',
    does: '运行程序、响应中断、产生地址和控制信号。ICode 直接连 Flash 接口；DCode 和系统总线接入总线矩阵。',
    how: '上电复位后从 0x0000 0000 取栈顶和复位向量。日常用 HAL/CMSIS 开发，通过 NVIC_EnableIRQ() 开中断，不直接操作内核寄存器。',
  },
  matrix: {
    what: '总线矩阵是 AHB 交叉开关，把 4 个主设备（DCode、系统总线、DMA1、DMA2）和 4 个从设备（Flash 接口、SRAM、FSMC、AHB2APB 桥）连在一起。',
    does: '当 CPU 和 DMA 同时访问不同从设备时并行放行；访问同一从设备时按轮换算法仲裁。',
    how: '纯硬件工作，不需要初始化。写代码时只需记住：DMA 和 CPU 抢同一块 SRAM/Flash 时会分时占用总线。',
  },
  flashif: {
    what: 'Flash 接口（FLITF）是 Flash 存储器和 AHB 之间的读接口，带两个 64 位预取缓冲。',
    does: '把 CPU 取指、取数和 DMA 访问转换成 Flash 读操作，并负责等待周期和预取。',
    how: '通过 FLASH_ACR 配置等待周期和预取。72MHz 时需要 2 个等待周期（0–24MHz 为 0，24–48MHz 为 1，48–72MHz 为 2）。',
  },
  flash: {
    what: 'C8T6 内置 64KB Flash，用来存放程序代码和常量，掉电不丢失。',
    does: '上电后 CPU 从这里取指令；也可以按页擦除、按半字编程，保存掉电参数。',
    how: '用 ST-Link 或串口 ISP 下载程序；运行时通过 FLASH_KEYR/CR/AR 寄存器擦写。地址从 0x0800 0000 开始，主存储块 1KB 一页。',
  },
  sram: {
    what: 'C8T6 内置 20KB SRAM，是运行时的数据存储器。',
    does: '存放全局变量、局部变量、栈和堆；CPU 可以 0 等待周期读写，DMA 也能直接访问。',
    how: '由链接脚本自动分配，起始地址 0x2000 0000。不需要手动初始化；掉电后内容丢失。',
  },
  fsmc: {
    what: 'FSMC 是外部存储器控制器，把外部 SRAM、NOR、NAND 映射进 CPU 的地址空间。',
    does: '让 CPU 像访问片内存储一样读写外部存储器，扩展容量。C8T6 没有 FSMC，大容量型号才有。',
    how: '大容量型号上配置 FSMC 的片选和时序寄存器（BCR/BTR），然后直接按地址读写。C8T6 上不可用。',
  },
  bridge2: {
    what: 'AHB2APB 桥接 2，把 AHB 上的访问同步到 APB2 总线。',
    does: '让 CPU 和 DMA 访问 APB2 上的高速外设，APB2 最高 72MHz。',
    how: '硬件自动转换，不需要配置。使用外设前先开时钟：RCC->APB2ENR 对应位。',
  },
  bridge1: {
    what: 'AHB2APB 桥接 1，把 AHB 上的访问同步到 APB1 总线。',
    does: '访问 APB1 上的低速外设。APB1 最高 36MHz，分频不能设错。',
    how: '硬件自动转换。使用前开时钟：RCC->APB1ENR 对应位；APB1 频率不要超过 36MHz。',
  },
  apb2: {
    what: 'APB2 外设板，是 72MHz 的高速外设总线。',
    does: '挂 GPIOA–D、ADC1/2、TIM1、SPI1、USART1、EXTI/AFIO。',
    how: '先在 RCC->APB2ENR 开对应外设时钟，再配置外设寄存器。GPIOA 寄存器基地址 0x4001 0800。',
  },
  apb1: {
    what: 'APB1 外设板，是最高 36MHz 的低速外设总线。',
    does: '挂 TIM2–4、USART2/3、I2C1/2、SPI2、CAN、USB、RTC、PWR、BKP、IWDG/WWDG。',
    how: '先在 RCC->APB1ENR 开对应外设时钟，再配置外设。注意 APB1 时钟不能超过 36MHz。',
  },
  dma1: {
    what: 'DMA1 是 7 通道的直接存储器访问控制器。',
    does: '在存储器与外设之间搬运数据，不需要 CPU 逐字节搬运，支持环形缓冲和传输完成中断。',
    how: '配置 DMA_CCR（方向、数据宽度、优先级）、DMA_CPAR（外设地址）、DMA_CMAR（存储器地址）、DMA_CNDTR（长度），然后使能通道。',
  },
  dma2: {
    what: 'DMA2 是第二个 DMA 控制器，5 个通道。',
    does: '额外提供 5 路搬运能力，部分型号才有。',
    how: '配置方式同 DMA1。C8T6 没有 DMA2，代码里不要使用。',
  },
  rcc: {
    what: 'RCC 是复位和时钟控制器，管理片内所有时钟源、分频器和复位。',
    does: '产生 HSI/HSE/PLL 时钟，分频出 HCLK、PCLK2、PCLK1；复位后除 SRAM 和 FLITF 外，外设时钟默认关闭。',
    how: '用 RCC->APB1ENR/APB2ENR/AHBENR 开外设时钟；SystemInit() 或 HAL 初始化 72MHz。使用任何外设前先开时钟。',
  },

  gpioa: {
    what: 'GPIOA 是通用输入输出端口 A，16 个引脚。',
    does: '输出高低电平、读取外部电平，也可以复用成 USART、SPI、TIM 等外设引脚。',
    how: '开 RCC_APB2ENR 的 GPIOA 时钟；用 CRL/CRH 配置模式和速度；ODR/BSRR 输出，IDR 读入。基地址 0x4001 0800。',
  },
  gpiob: {
    what: 'GPIOB 是通用输入输出端口 B。',
    does: '同 GPIOA，提供额外 16 个可配置引脚。',
    how: '开 RCC_APB2ENR 的 GPIOB 时钟；寄存器基地址 0x4001 0C00。',
  },
  gpioc: {
    what: 'GPIOC 是通用输入输出端口 C。',
    does: 'C8T6 上主要提供 PC13–PC15，常用于 LED 或按键。',
    how: '开 RCC_APB2ENR 的 GPIOC 时钟；寄存器基地址 0x4001 1000。',
  },
  gpiod: {
    what: 'GPIOD 是通用输入输出端口 D。',
    does: 'C8T6 上只有 PD0/PD1 两个引脚，可作为普通 I/O 或复用功能。',
    how: '开 RCC_APB2ENR 的 GPIOD 时钟；寄存器基地址 0x4001 1400。',
  },
  adc1: {
    what: 'ADC1 是 12 位逐次逼近型模数转换器。',
    does: '把模拟电压转换成 0–4095 的数字量，支持规则通道和注入通道。',
    how: '开 RCC_APB2ENR 的 ADC1 时钟；配置通道、采样时间、触发源；启动转换后读 DR。参考电压通常为 3.3V。',
  },
  adc2: {
    what: 'ADC2 是第二个 12 位 ADC，与 ADC1 共享部分通道。',
    does: '可以和 ADC1 配合做双 ADC 同步采样。',
    how: '配置方式同 ADC1；C8T6 上 ADC1/ADC2 共 12 路外部通道。',
  },
  tim1: {
    what: 'TIM1 是高级控制定时器，16 位。',
    does: '产生 PWM、互补输出和死区，常用于控制电机；支持输入捕获和输出比较。',
    how: '开 RCC_APB2ENR 的 TIM1 时钟；配置 ARR/PSC 定时，CCR 占空比，BDTR 死区；开启 MOE 后输出。',
  },
  spi1: {
    what: 'SPI1 是串行外设接口，挂在 APB2 上。',
    does: '和 Flash、传感器、屏幕等 SPI 设备高速通信，支持主机/从机。',
    how: '开 RCC_APB2ENR 的 SPI1 时钟；配置 CR1 的主从、时钟极性、分频；写 DR 发送，读 DR 接收。',
  },
  usart1: {
    what: 'USART1 是通用同步/异步收发器，挂在 APB2 上。',
    does: '做串口通信、打印调试信息，最高可跑 72MHz 总线时钟分频后的速率。',
    how: '开 RCC_APB2ENR 的 USART1 时钟；配置波特率 BRR、字长、停止位；使能 TE/RE 后读写 DR。',
  },
  exti: {
    what: 'EXTI 是外部中断控制器，AFIO 负责复用功能重映射。',
    does: '把 GPIO 边沿或外设事件变成中断/事件，唤醒 CPU 或触发 DMA。',
    how: '开 RCC_APB2ENR 的 AFIO 时钟；用 AFIO_EXTICR 选择端口，配置 EXTI 触发边沿，再在 NVIC 里开中断。',
  },
  tim2: {
    what: 'TIM2–TIM4 是三个通用 16 位定时器。',
    does: '做定时、输入捕获、输出比较和 PWM。',
    how: '开 RCC_APB1ENR 的 TIMx 时钟；配置 PSC/ARR 决定周期，CCR 决定占空比或比较值。',
  },
  usart2: {
    what: 'USART2/3 是挂在 APB1 上的两个通用串口。',
    does: '做串口通信，常用来接蓝牙、GPS、上位机。',
    how: '开 RCC_APB1ENR 的 USARTx 时钟；配置 BRR 波特率和引脚复用；读写 DR。',
  },
  i2c: {
    what: 'I2C1/2 是两路 I2C 总线接口。',
    does: '用两根线（SCL/SDA）连接多个从设备，支持标准/快速模式，可使用 DMA。',
    how: '开 RCC_APB1ENR 的 I2Cx 时钟；配置 CR2 频率、CCR 时钟、TRISE；用起始/地址/数据/停止流程收发。',
  },
  spi2: {
    what: 'SPI2 是挂在 APB1 上的 SPI 接口。',
    does: '和 SPI 从设备通信，可配合 DMA 收发。',
    how: '开 RCC_APB1ENR 的 SPI2 时钟；配置方式同 SPI1。',
  },
  can: {
    what: 'CAN 是 bxCAN 控制器。',
    does: '在汽车和工业现场做多节点总线通信，支持 CAN 2.0A/B。',
    how: '开 RCC_APB1ENR 的 CAN 时钟；配置位时序、过滤器、发送邮箱；通过 CAN_TIxR 等寄存器收发。',
  },
  usb: {
    what: 'USB 是 USB 全速设备接口。',
    does: '让 STM32 作为 USB 设备与主机通信，可做虚拟串口、HID 等。',
    how: '开 RCC_APB1ENR 的 USB 时钟；配置 USB 时钟为 48MHz；使用 HAL 的 USB 设备库初始化端点。',
  },
  rtc: {
    what: 'RTC/PWR/BKP 分别是实时时钟、电源控制和后备寄存器。',
    does: 'RTC 走时，PWR 管理低功耗模式，BKP 在 VDD 掉电时由 VBAT 保存少量数据。',
    how: '开 RCC_APB1ENR 的 PWR/BKP 时钟；配置 RTC 时钟源（LSE/LSI）和预分频；通过 BKP 寄存器保存 20 字节。',
  },
  iwdg: {
    what: 'IWDG/WWDG 是独立看门狗和窗口看门狗。',
    does: '程序跑飞时自动复位；WWDG 还要求喂狗落在指定时间窗口内。',
    how: 'IWDG 由内部 40kHz RC 驱动，开 IWDG_KR 启动并按 0xAAAA 喂狗；WWDG 由 PCLK1 驱动，配置窗口值和计数器。',
  },
};

// 每条总线的讲解
export const TRACE_INFO = {
  icode: {
    what: 'ICode 是 Cortex-M3 的指令总线，直接连接 Flash 接口，不经过总线矩阵。',
    does: 'CPU 取指时指令从这里送到内核，指令预取在 Flash 接口完成。',
    how: '硬件自动工作。想提高取指效率，可以在 FLASH_ACR 里开启预取缓冲并配置正确的等待周期。',
  },
  dcode: {
    what: 'DCode 是内核的数据总线，接入总线矩阵。',
    does: '常量加载、调试访问走这条线，经矩阵到 Flash 或 SRAM。',
    how: '无需配置。访问 const 数据和调试时自动使用。',
  },
  system: {
    what: '系统总线是内核的外设总线，接入总线矩阵。',
    does: 'CPU 访问 SRAM、Flash 和所有 APB 外设都经过这条总线。',
    how: '无需配置。读写外设寄存器时自动走这条线。',
  },
  'matrix-flashif': {
    what: '总线矩阵到 Flash 接口的 AHB 通路。',
    does: 'DMA 等主设备经矩阵访问 Flash 时走这条线。',
    how: '硬件自动。DMA 访问 Flash 时要和 CPU 取指分时占用。',
  },
  'flashif-flash': {
    what: 'Flash 接口到 Flash 存储器的读取通道。',
    does: '把接口的读请求送到 Flash 阵列，返回指令或数据。',
    how: '硬件自动。擦写 Flash 时不能同时读取。',
  },
  'matrix-sram': {
    what: '总线矩阵到 SRAM 的通路。',
    does: 'CPU 和 DMA 访问 SRAM 时走这条线。',
    how: '硬件自动。DMA 和 CPU 同时访问时会分时占用。',
  },
  'matrix-fsmc': {
    what: '总线矩阵到 FSMC 的通路。',
    does: '大容量型号访问外部存储器时使用。',
    how: 'C8T6 没有 FSMC，这条线在本型号上不存在。',
  },
  'matrix-ahb': {
    what: 'AHB 系统总线，是总线矩阵通向 APB 桥的主干。',
    does: '把 CPU/DMA 的访问送到桥接 1/2，再分发到 APB1/APB2。',
    how: '硬件自动。APB1/APB2 的频率由 RCC 的 APB 预分频决定。',
  },
  'ahb-b2': {
    what: 'AHB 到桥接 2 的分支。',
    does: '把访问送到 APB2 域。',
    how: '硬件自动。',
  },
  'ahb-b1': {
    what: 'AHB 到桥接 1 的分支。',
    does: '把访问送到 APB1 域。',
    how: '硬件自动。',
  },
  'b2-apb2': {
    what: '桥接 2 到 APB2 外设板的通路。',
    does: '把 AHB 访问转换成 APB2 时序。',
    how: '使用外设前先开 RCC_APB2ENR 对应时钟。',
  },
  'b1-apb1': {
    what: '桥接 1 到 APB1 外设板的通路。',
    does: '把 AHB 访问转换成 APB1 时序。',
    how: '使用外设前先开 RCC_APB1ENR 时钟；APB1 不能超过 36MHz。',
  },
  'dma1-matrix': {
    what: 'DMA1 到总线矩阵的 DMA 总线。',
    does: 'DMA1 作为主设备访问 SRAM、Flash 和外设时走这条线。',
    how: '配置 DMA 通道后，硬件自动发起传输。',
  },
  'dma2-matrix': {
    what: 'DMA2 到总线矩阵的 DMA 总线（部分型号）。',
    does: 'DMA2 的访问通路。',
    how: 'C8T6 没有 DMA2。',
  },
  'dma-request': {
    what: 'DMA 请求线，从外设回到 DMA 控制器。',
    does: 'USART、SPI、ADC、TIM 等外设准备好数据时，向 DMA 发请求。',
    how: '在 DMA 通道配置里选择对应外设请求，硬件自动握手。',
  },
  'rcc-matrix': {
    what: 'RCC 到总线矩阵的时钟/复位通路。',
    does: '把 HCLK 送到内核和矩阵，复位信号也由此分发。',
    how: '由 RCC 配置 AHB 预分频；复位后外设时钟默认关闭。',
  },
  'rcc-bridge': {
    what: 'RCC 到 AHB2APB 桥的时钟线。',
    does: '把 PCLK1/PCLK2 送到 APB1/APB2 域。',
    how: 'RCC 的 APB 预分频决定频率，APB1 ≤36MHz，APB2 ≤72MHz。',
  },
};
