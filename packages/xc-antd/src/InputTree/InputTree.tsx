import {Button, Input, Tree, type TreeProps} from "antd";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";

interface InputTreeProps {
    treeData?: any[];
    onSelect?: TreeProps['onSelect']
    defaultExpandedKeys?: TreeProps['defaultExpandedKeys']
    defaultSelectedKeys?: TreeProps['defaultSelectedKeys']
    height: number
}

export function InputTree({
                              treeData,
                              onSelect,
                              defaultExpandedKeys,
                              defaultSelectedKeys,
                              height
                          }: InputTreeProps) {
    return (
        <div>
            <div className={'flex'}>
                <Button icon={<PlusOutlined/>}></Button>
                <div className={'w-2'}></div>
                <Input suffix={<SearchOutlined/>}></Input>
            </div>
            <div className={'h-2'}></div>
            <div>
                <Tree
                    height={height}
                    defaultExpandParent
                    defaultExpandedKeys={defaultExpandedKeys}
                    defaultSelectedKeys={defaultSelectedKeys}
                    showIcon
                    treeData={treeData}
                    onSelect={onSelect}
                ></Tree>
            </div>
        </div>
    );
}

export default InputTree;
