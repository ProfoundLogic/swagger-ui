import React from 'react';
import CollapsedImg from "../../img/folder-closed.svg";
import ExpandedImg from "../../img/folder-open.svg";
import RefreshImg from "../../img/refresh.svg";

export default class CategoryTreeItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = { expanded: false, selected: false };
        props.instances.push(this);

        if (props.data && props.data.allItems)
            this.state.selected = true;
    }

    isSelected = () => {
        return this.state.selected;
    }
    setSelected = (newValue) => {
        this.setState({ selected: newValue });
    }
    getData = () => {
        return this.props.data;
    }

    onExpanded = (event) => {
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        let { data, root, onSelectionChanged, refreshCategories, instances, parentExpanded } = this.props;
        let expaneded = this.state.expanded;
        let selected = this.state.selected;
        let rowClass = "pjs-treeitem-container";

        let itemClass = root ? "pjs-root-item" : "pjs-child-item";
        if (selected)
            itemClass += " selected";
        
        if (parentExpanded === false )
            rowClass += " hidden";

        let textClass = "pjs-treeitem-text";
        if (data.children)
            textClass += " has-children";
        else
            textClass += " no-children";

        return (
            <div className={rowClass}>
                <div className={itemClass}>
                    {!data.children ? null : <img src={expaneded ? ExpandedImg : CollapsedImg} alt={expaneded ? "Collapse" : "Expand"} onClick={this.onExpanded} />}
                    <div className={textClass} onClick={event => onSelectionChanged(event, this)}>{data.name}</div>
                    {!data.allItems ? null : <img className="category-refresh-img" src={RefreshImg} alt="Refresh" onClick={refreshCategories} />}
                </div>

                {!data.children ? null :
                    data.children.map((value, index) => {
                        return <CategoryTreeItem key={index} parentExpanded={expaneded} instances={instances} data={value} onSelectionChanged={onSelectionChanged}></CategoryTreeItem>
                    })
                }
            </div>
        );
    }
}