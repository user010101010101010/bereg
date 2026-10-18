import assert from 'node:assert/strict';
import test from 'node:test';
import {createHeaderScrollState,updateHeaderScroll} from '../lib/header-scroll.ts';

test('header stays visible near the top and hides on downward scrolling',()=>{
 let state=createHeaderScrollState();
 state=updateHeaderScroll(state,80);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,120);assert.equal(state.hidden,true);
 state=updateHeaderScroll(state,250);assert.equal(state.hidden,true);
});

test('upward movement reveals the header while small reversals do not flicker',()=>{
 let state=updateHeaderScroll(createHeaderScrollState(),400);
 state=updateHeaderScroll(state,398);assert.equal(state.hidden,true);
 state=updateHeaderScroll(state,395);assert.equal(state.hidden,true);
 state=updateHeaderScroll(state,391);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,393);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,400);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,406);assert.equal(state.hidden,true);
});

test('an open menu or keyboard focus pins the header and resets scroll accumulation',()=>{
 let state=updateHeaderScroll(createHeaderScrollState(),300);
 state=updateHeaderScroll(state,500,true);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,700,true);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,705);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,720);assert.equal(state.hidden,true);
});

test('restored pages, returning to top, and top overscroll show the header',()=>{
 let state=createHeaderScrollState(600);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,620);assert.equal(state.hidden,true);
 state=updateHeaderScroll(state,0);assert.equal(state.hidden,false);
 state=updateHeaderScroll(state,-30);assert.equal(state.hidden,false);assert.equal(state.lastY,0);
});
