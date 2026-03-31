import api from './api';
import { useQuery } from '@tanstack/react-query';

import type { AccountCharacter, ServerStatistics } from './types';

export type GameServerInfo = {
  serverId: number;
  networkPort: number;
  description: string;
  experienceRate: number;
  gameConfigurationId: string;
};

const getServerStatistics = async (): Promise<ServerStatistics> => {
  const response = await api.get('/game/statistics');
  return response.data;
};

const getGameServers = async (): Promise<GameServerInfo[]> => {
  const response = await api.get('/game/servers');
  return response.data;
};

const getOnlinePlayers = async (): Promise<AccountCharacter[]> => {
  const response = await api.get('/game/onlines');
  return response.data;
};

export const useGetServerStatistics = () => {
  return useQuery<ServerStatistics, Error>({
    queryKey: ['game', 'statistics'],
    queryFn: () => getServerStatistics(),
  });
};

export const useGetGameServers = (enabled = true) => {
  return useQuery<GameServerInfo[], Error>({
    queryKey: ['game', 'servers'],
    queryFn: () => getGameServers(),
    enabled,
  });
};

export const useGetOnlinePlayers = (
  enabled = true,
  refetchInterval?: number,
) => {
  return useQuery<AccountCharacter[], Error>({
    queryKey: ['game', 'onlines'],
    queryFn: () => getOnlinePlayers(),
    enabled,
    refetchInterval,
  });
};
