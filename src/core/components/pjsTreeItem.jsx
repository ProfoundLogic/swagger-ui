import React from 'react';
import PropTypes from "prop-types"
import CollapsedImg from "../../img/folder-closed.svg";
import ExpandedImg from "../../img/folder-open.svg";
import RefreshImg from "../../img/refresh.svg";

export default class PJSTreeItem extends React.Component {
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
        let { data, root, onSelectionChanged, refreshCategories, instances } = this.props;
        let expaneded = this.state.expanded;
        let selected = this.state.selected;

        let itemClass = root ? "pjs-root-item" : "pjs-child-item";
        if (selected)
            itemClass += " selected";

        let textClass = "pjs-treeitem-text";
        if (data.children)
            textClass += " has-children";
        else
            textClass += " no-children";

        return (
            <div>
                <div class={itemClass}>
                    {!data.children ? null : <img src={expaneded ? ExpandedImg : CollapsedImg} alt={expaneded ? "Collapse" : "Expand"} onClick={this.onExpanded} />}
                    <div class={textClass} onClick={event => onSelectionChanged(event, this)}>{data.name}</div>
                    {!data.allItems ? null : <img class="category-refresh-img" src={RefreshImg} alt="Refresh" onClick={refreshCategories} />}
                </div>

                {this.state.expanded !== true || !data.children ? null :
                    data.children.map((value, index) => {
                        return <PJSTreeItem instances={instances} data={value} onSelectionChanged={onSelectionChanged}></PJSTreeItem>
                    })
                }
            </div>
        );
    }
}