import React from 'react';
import PropTypes from "prop-types"

import Tree, { TreeNode } from 'rc-tree';
import SearchImg from "../../img/search.svg";
import RefreshImg from "../../img/refresh.svg";

export default class CategoryFilter extends React.Component {
    static propTypes = {
        errSelectors: PropTypes.object.isRequired,
        errActions: PropTypes.object.isRequired,
        specActions: PropTypes.object.isRequired,
        specSelectors: PropTypes.object.isRequired,
        layoutSelectors: PropTypes.object.isRequired,
        layoutActions: PropTypes.object.isRequired,
        getComponent: PropTypes.func.isRequired
    }

    state = {
        searchText: "",
        selectedCategoryUrl: "",
        treeData: [{ key: "0-0", title: "Loading...", urlSearch: "", isLeaf: true, className: "all-categories" }]
    };

    componentDidMount() {
        this.refreshCategories();
    }

    refreshCategories = (event) => {
        let { specSelectors } = this.props;

        this.setState({ selectedKeys: [], selectedCategoryUrl: "" });
        let url = specSelectors.url();
        console.log(url);
        let parts = url.split("?");
        url = parts.shift().replace(/openapi\.json/i, "api-categories") + "?includeempty=false";

        let processResults = function (data) {
            if (typeof data != "object") {
                alert(data);
                return;
            }

            const categories = [this.state.treeData[0]];

            let loop = (data, parent) => {
                for (let i = 0; i < data.length; i++) {
                    let item = {}
                    item.title = data[i].name;

                    if (parent)
                        item.key = `${parent.key}-${i}`;
                    else
                        item.key = `0-${i + 1}`;

                    if (parent) {
                        item.urlSearch = `?cat=${parent.title}&subcat=${item.title}`;
                        parent.children.push(item);
                    } else {
                        item.urlSearch = `?cat=${item.title}`;
                        categories.push(item);
                    }

                    if (data[i].subCategories && data[i].subCategories.length) {
                        item.children = [];
                        loop(data[i].subCategories, item);
                    }
                    else
                        item.isLeaf = true;
                }
            };

            loop(data);

            categories.push({ isLeaf: true, disabled: true, className: "category-separator" });
            categories.push({ key: `0-${data.length + 1}`, title: "All Others", urlSearch: "?cat=&subcat=", isLeaf: true, className: "all-other-categories" });

            categories[0].title = "All Categories";
            categories[0].className = "all-categories"
            this.setState({ treeData: categories, selectedKeys: ["0-0"], expandedKeys: [] });

            // If this was triggered from the Refresh button, then we need to all
            if (event) this.performSearch();
        }

        let me = this;
        if (window.isdev)
            processResults.call(me, [{"name":"Big Area B","subCategories":[{"name":"BBB"},{"name":"Scot"},{"name":"little a"},{"name":"little b"},{"name":"little c"}]},{"name":"Business Area 1","subCategories":[{"name":"Insurance"}]},{"name":"Business Area 4","subCategories":[{"name":"Warehouse"}]},{"name":"Product XYZ","subCategories":[{"name":"Appliction y"},{"name":"Appliction yyyy"}]},{"name":"Scot","subCategories":[{"name":"Bug"}]}]);
        else {
            fetch(url).then(response => !response.ok ? response.statusText : response.json()).then(data => processResults.call(me, data));
        }
    }

    onSelect = (selectedKeys, info) => {
        let key = info.node.props.eventKey;
        this.setState({ selectedKeys: [key], selectedCategoryUrl: info.node.props.urlSearch });

        setTimeout(this.performSearch);
    };

    onSearchTextChanged = (event) => {
        console.log("onSearchTextChanged:", event);
        const { target: { value } } = event
        this.setState({ searchText: value });
    }

    handleKeyPress = (event) => {
        console.log("handleKeyPress:", event);
        if (event.key === 'Enter')
            this.performSearch();
    }

    performSearch = () => {
        let { specActions, specSelectors } = this.props;
        let url = specSelectors.url();
        let parts = url.split("?");
        url = parts.shift();

        console.log("performSearch:", this.state.selectedCategoryUrl, this.state.searchText);
        let urlSearch = this.state.selectedCategoryUrl;
        let searchText = this.state.searchText.trim();

        if (searchText) {
            //  bob "scot was here" noway
            let urlKeyWords = [];
            do {
                let keyWord = null;

                if (searchText.charAt(0) == '"') {
                    let endIdx = searchText.indexOf('"', 1);
                    if (endIdx < 0) endIdx = searchText.length;
                    keyWord = searchText.substring(1, endIdx).trim();
                    searchText = searchText.substring(endIdx + 1).trim();
                }
                else {
                    let endIdx = searchText.indexOf(' ', 1);
                    if (endIdx < 0) endIdx = searchText.length;
                    keyWord = searchText.substring(0, endIdx).trim();
                    searchText = searchText.substring(endIdx).trim();
                }

                if (keyWord)
                    urlKeyWords.push(`keyWords=${keyWord}`);

            } while (searchText);

            if (urlKeyWords.length)
                searchText = urlKeyWords.join("&");
        }

        urlSearch += (urlSearch ? "&" : "?") + searchText;

        specActions.updateUrl(url + urlSearch);
        specActions.download();
    }

    render() {
        let { getComponent } = this.props;
        let Col = getComponent("Col")
        return (
            <Col className="pjs-api-search-column">
                <div class="filter-box-heading">
                    <h2 class="title">Filter</h2>
                </div>
                <div class="keywords-body">
                    <input type="text" value={this.state.searchText} onKeyPress={this.handleKeyPress} placeholder='Keywords or "phrase"' onChange={this.onSearchTextChanged} />
                    <img src={SearchImg} alt="Search" onClick={this.performSearch} />
                </div>
                <div class="category-heading">
                    <div class="title">Categories</div>
                    <img src={RefreshImg} alt="Refresh" onClick={this.refreshCategories} />
                </div>
                <Tree
                    className="category-tree"
                    selectedKeys={this.state.selectedKeys}
                    showIcon="false"
                    onSelect={this.onSelect}
                    treeData={this.state.treeData}
                />
            </Col>


            // <div>
            //     <div>
            //         <input type="text" value={this.state.searchText} onKeyPress={this.handleKeyPress}></input>
            //         <button onClick={this.doSearch}>Search</button>
            //     </div>
            //     <div style="border:1px black solid">
            //         <div>
            //             <div>Categories</div>
            //             <button onClick={this.refreshCategories}>Refresh</button>
            //         </div>
            //         <Tree
            //             selectedKeys={this.state.selectedKeys}
            //             showIcon="false"
            //             onSelect={this.onSelect}
            //             treeData={this.state.treeData}
            //         />
            //     </div>
            // </div>
        );
    }
}
