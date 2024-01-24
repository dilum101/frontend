/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import type { RoutedTab } from 'ui/shared/Tabs/types';

import config from 'configs/app';
import useHasAccount from 'lib/hooks/useHasAccount';
import useIsMobile from 'lib/hooks/useIsMobile';
import useNewTxsSocket from 'lib/hooks/useNewTxsSocket';
import { TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TxsWatchlist from 'ui/txs/TxsWatchlist';
import TxsWithFrontendSorting from 'ui/txs/TxsWithFrontendSorting';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  py: 5,
  marginTop: -5,
};

const Transactions = () => {
  const token = sessionStorage.getItem('JwtToken');
  const role = sessionStorage.getItem('role');
  const asset_addresses = sessionStorage.getItem('asset_addresses');

  const verifiedTitle =
    config.chain.verificationType === 'validation' ? 'Validated' : 'Mined';
  const router = useRouter();
  const isMobile = useIsMobile();
  const txsQuery = useQueryWithPages({
    resourceName:
      router.query.tab === 'pending' ? 'txs_pending' : 'txs_validated',
    filters: {
      filter: router.query.tab === 'pending' ? 'pending' : 'validated',
    },
    options: {
      enabled:
        !router.query.tab ||
        router.query.tab === 'validated' ||
        router.query.tab === 'pending',
      placeholderData: generateListStub<'txs_validated'>(TX, 50, {
        next_page_params: {
          block_number: 9005713,
          index: 5,
          items_count: 50,
          filter: 'validated',
        },
      }),
    },
  });

  const filterQuery: any = {
    ...txsQuery,
    data: txsQuery.data?.items ?
      {
        ...txsQuery.data,

        items: txsQuery.data.items.filter((item) =>
          asset_addresses?.includes(item.from.hash),
        ),
      } :
      undefined,
  };

  const txsWatchlistQuery = useQueryWithPages({
    resourceName: 'txs_watchlist',
    options: {
      enabled: router.query.tab === 'watchlist',
      placeholderData: generateListStub<'txs_watchlist'>(TX, 50, {
        next_page_params: {
          block_number: 9005713,
          index: 5,
          items_count: 50,
        },
      }),
    },
  });

  const { num, socketAlert } = useNewTxsSocket();

  const hasAccount = useHasAccount();

  const tabs: Array<RoutedTab> = [
    {
      id: 'validated',
      title: verifiedTitle,
      component: (
        <TxsWithFrontendSorting
          query={ role !== 'admin' ? filterQuery : txsQuery }
          showSocketInfo={
            role !== 'admin' ?
              filterQuery.pagination.page === 1 :
              txsQuery.pagination.page === 1
          }
          socketInfoNum={ num }
          socketInfoAlert={ socketAlert }
        />
      ),
    },
    {
      id: 'pending',
      title: 'Pending',
      component: (
        <TxsWithFrontendSorting
          query={ role !== 'admin' ? filterQuery : txsQuery }
          showBlockInfo={ false }
          showSocketInfo={
            role !== 'admin' ?
              filterQuery.pagination.page === 1 :
              txsQuery.pagination.page === 1
          }
          socketInfoNum={ num }
          socketInfoAlert={ socketAlert }
        />
      ),
    },
    hasAccount ?
      {
        id: 'watchlist',
        title: 'Watch list',
        component: <TxsWatchlist query={ txsWatchlistQuery }/>,
      } :
      undefined,
  ].filter(Boolean);

  const pagination =
    router.query.tab === 'watchlist' ?
      txsWatchlistQuery.pagination :
      role !== 'admin' ?
        filterQuery.pagination :
        txsQuery.pagination;

  return (
    <>
      <PageTitle title="Transactions" withTextAd/>
      <RoutedTabs
        tabs={ tabs }
        tabListProps={ isMobile ? undefined : TAB_LIST_PROPS }
        rightSlot={
          pagination.isVisible && !isMobile ? (
            <Pagination my={ 1 } { ...pagination }/>
          ) : null
        }
        stickyEnabled={ !isMobile }
      />
    </>
  );
};

export default Transactions;
