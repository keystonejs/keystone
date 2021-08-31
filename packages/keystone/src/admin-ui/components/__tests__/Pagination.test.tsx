/**
 * @jest-environment jsdom
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Pagination } from '../Pagination';
const useRouter = jest.spyOn(require('next/router'), 'useRouter');
describe('<Pagination/>', () => {
  it('should render a nav element with role navigation', () => {
    useRouter.mockImplementation(() => ({
      route: '/',
      pathname: '/',
      query: {
        pageSize: '10',
        page: '1',
      },
    }));
    render(
      <Pagination
        pageSize={10}
        currentPage={1}
        total={30}
        list={{ plural: 'Items', singular: 'Item' }}
      />
    );
    screen.getByRole('navigation');
  });
  describe('chevron functionality', () => {
    it('should have a disabled back button, when on the first page', () => {
      useRouter.mockImplementation(() => ({
        route: '/',
        pathname: '/',
        query: {
          pageSize: '10',
          page: '1',
        },
      }));
      render(
        <Pagination
          pageSize={10}
          currentPage={1}
          total={30}
          list={{ plural: 'Items', singular: 'Item' }}
        />
      );
      expect(screen.getByLabelText('Previous page')).toHaveStyle({
        pointerEvents: 'none',
      });
    });
    it('should have a disabled next button, when on the last page', () => {
      useRouter.mockImplementation(() => ({
        route: '/',
        pathname: '/',
        query: {
          pageSize: '10',
          page: 3,
        },
      }));
      render(
        <Pagination
          pageSize={10}
          currentPage={3}
          total={30}
          list={{ plural: 'Items', singular: 'Item' }}
        />
      );
      expect(screen.getByLabelText('Next page')).toHaveStyle({
        pointerEvents: 'none',
      });
    });
    it('should navigate to the next page when the next page link is clicked', () => {
      const push = jest.fn().mockImplementation(() => Promise.resolve());
      useRouter.mockImplementation(() => ({
        route: '/',
        pathname: '/',
        prefetch: () => Promise.resolve(),
        query: {
          pageSize: '10',
          page: 1,
        },
        push,
      }));
      render(
        <Pagination
          pageSize={10}
          currentPage={1}
          total={30}
          list={{ plural: 'Items', singular: 'Item' }}
        />
      );
      userEvent.click(screen.getByLabelText('Next page'));
      expect(push).toHaveBeenCalledTimes(1);
      expect(push.mock.calls[0][0]).toBe('/?pageSize=10&page=2');
    });
    it('should navigate to the previous page when the previous page link is clicked', () => {
      const push = jest.fn().mockImplementation(() => Promise.resolve());
      useRouter.mockImplementation(() => ({
        route: '/',
        pathname: '/',
        prefetch: () => Promise.resolve(),
        query: {
          pageSize: '10',
          page: 3,
        },
        push,
      }));
      render(
        <Pagination
          pageSize={10}
          currentPage={2}
          total={30}
          list={{ plural: 'Items', singular: 'Item' }}
        />
      );
      userEvent.click(screen.getByLabelText('Previous page'));
      expect(push).toHaveBeenCalledTimes(1);
      expect(push.mock.calls[0][0]).toBe('/?pageSize=10&page=1');
    });
  });
});
