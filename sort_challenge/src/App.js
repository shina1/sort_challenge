import React, { useCallback, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
// import { sortBy } from 'lodash';
import List from './components/List';
import SearchForm from './components/SearchForm';



const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload.hits,
        currentPage: action.payload.page
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};


const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );
  const [sortState, setSortState] = useState(null);

  const [urls, setUrls] = useState(
    [`${API_ENDPOINT}${searchTerm}`]
  );

  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );
  const [reverse, setReverse] = useState(false);

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
  
      const result = await axios.get(urls[urls.length - 1]);



      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data,
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => {
    // avoiding duplicate search
    const sliceIndex = urls.length == 5 ? 1 : 0; 
    setUrls(Array.from(new Set(urls.slice(sliceIndex).concat(`${API_ENDPOINT}${searchTerm}`))));

    event.preventDefault();
  };

  const handleReverse = () => {
      setReverse(!reverse)
  }
//  const handleBreadCrumb = (term)=>{
//   ;
//  }

  return (
    <div>
      <h1>My Hacker Stories</h1> 

      <h3>Sort</h3> <br />
      <label for="sort">Sort By</label> <br />
      
        <select name="sort" id="lang" onChange={(e)=> setSortState(e.target.value)}>
          <option value="def">select...</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="points">Points</option>
          <option value="num_comments">Num Comments</option>
      </select> <br /> <br />
      <button onDoubleClick={handleReverse}>Reverse</button> <br />
      {
        // setSearchTerm
        
        urls.slice(0, urls.length - 1).map(el => { 
          return <button onClick={(e) => setSearchTerm(e.target.textContent)}>{el.split("=")[1]}</button>
        })
      }

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} sortBy={sortState} reverse={reverse} />
      )}
    </div>
  );
};

export default App;

