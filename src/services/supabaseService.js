import { supabase } from './supabaseClient';

export class SupabaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async create(data) {
    const { data: result, error } = await supabase.from(this.tableName).insert([data]).select();

    if (error) throw error;
    return result[0];
  }

  async getAll(options = {}) {
    const { select = '*', filters = {}, range, orderBy } = options;

    let query = supabase.from(this.tableName).select(select);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const [operator, filterValue] = Object.entries(value)[0];
        query = query[operator](key, filterValue);
      } else {
        query = query.eq(key, value);
      }
    });

    // Apply pagination
    if (range) {
      query = query.range(range[0], range[1]);
    }

    // Apply ordering
    if (orderBy) {
      const { column, ascending = true } = orderBy;
      query = query.order(column, { ascending });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getById(id, select = '*') {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;
    return result[0];
  }

  async delete(id) {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  async search(column, query) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .ilike(column, `%${query}%`);

    if (error) throw error;
    return data;
  }

  subscribeToChanges(callback, filter = null) {
    const channel = supabase
      .channel(`${this.tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          ...(filter && { filter }),
        },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}

// Specific service instances
export const SecteursService = new SupabaseService('secteurs');
export const UsersService = new SupabaseService('users');
// Add other services as needed
