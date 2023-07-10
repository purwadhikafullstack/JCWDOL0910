import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import ProductCard from "../components/Product/ProductCard";
import { setSort } from "../features/stocks/stocksSlice";
import Pagination from "../components/utils/Pagination";
import SearchInputList from "../components/utils/SearchInputList";
import SortSection from "../components/Admins/Products/SortSection";

function Products() {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = useSelector(
    (state) => state.productCategories.productCategories
  );
  const currentPage = useSelector((state) => state.products.currentPage);
  const totalPages = useSelector((state) => state.products.totalPages);
  const itemsPerPage = useSelector((state) => state.products.itemsPerPage);
  const productList = useSelector((state) => state.products.products);

  const handleSort = (option) => {
    setSelectedSort(option);
    dispatch(setSort(option));
    dispatch(fetchProducts(currentPage, searchInput, option));
  };

  const handlePageChange = (page) => {
    dispatch(fetchProducts(page, searchInput, selectedSort, selectedCategory));
  };

  const renderProductList = () => {
    return productList?.map((product) => {
      return <ProductCard product={product} />;
    });
  };

  useEffect(() => {
    dispatch(
      fetchProducts(currentPage, searchInput, selectedSort, selectedCategory)
    );
  }, [dispatch, currentPage, searchInput, selectedSort, selectedCategory]);

  return (
    <div>
      <div className="text-center p-4 text-3xl lg:text-4xl font-bold">
        Our Product
      </div>
      <div className=" bg-slate-200 flex flex-col items-center justify-center m-10 p-4 rounded gap-2">
        <div className="">
          <div>
            <SearchInputList
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />
          </div>
          <div>
            <SortSection
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              handleSort={handleSort}
            />
          </div>
        </div>
        <div className="flex flex-wrap  justify-center ">
          {renderProductList()}
        </div>
        <div className="flex gap-3 ">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default Products;
