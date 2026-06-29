/**
 * @description Table 的两种模式，一个是 crud 增删改查模式，一个是 simple 模式
 * · crud 模式：就是包含一套增删改查的接口，用于快速开发
 * · simple 模式：就是不包含增删改查的接口，用于自定义开发
 * @author wxc
 * */
export type TableMode = "crud"|"simple"
