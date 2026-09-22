import { Injectable } from "@angular/core";
import { Nfse } from "../../features/nfse/models/nfse";
import { NfseMetadata } from "./nfse-metadata";

// * Para relembrar: Store = tabela para o IndexedDB

@Injectable({
    providedIn: 'root'
})
export class NFSeDatabaseService {
    private readonly dbName = 'nfse_moduledb';
    private readonly dbVersion = 3;
    private readonly nfseStore = 'nfse';
    private readonly metadataStore = 'metadata';
    
    private db?: IDBDatabase;

    async abrir(): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = () => {
                const db = request.result;
                let store: IDBObjectStore;

                // criação da tabela de metadata 
                if (!db.objectStoreNames.contains(this.metadataStore)) {
                    db.createObjectStore(this.metadataStore, { keyPath: 'chave' });
                }

                // criação da tabela de nfse
                if (!db.objectStoreNames.contains(this.nfseStore)) {
                    store = db.createObjectStore(this.nfseStore, { keyPath: 'id' });
                } else {
                    store = request.transaction!.objectStore(this.nfseStore);
                }

                if (!store.indexNames.contains('status')) {
                    store.createIndex('status', 'status', { unique: false });
                }
                if (!store.indexNames.contains('adn_status')) {
                    store.createIndex('adn_status', 'adn_status', { unique: false });
                }
                if (!store.indexNames.contains('dh_emi')) {
                    store.createIndex('dh_emi', 'dh_emi', { unique: false });
                }
                if (!store.indexNames.contains('prest_cpf_cnpj')) {
                    store.createIndex('prest_cpf_cnpj', 'prest_cpf_cnpj', { unique: false });
                }
                if (!store.indexNames.contains('toma_cpf_cnpj')) {
                    store.createIndex('toma_cpf_cnpj', 'toma_cpf_cnpj', { unique: false });
                }
                if (!store.indexNames.contains('chave_acesso')) {
                    store.createIndex('chave_acesso', 'chave_acesso', { unique: false });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async salvar(nfse: Nfse): Promise<void> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readwrite');
            const store = transaction.objectStore(this.nfseStore);

            store.put(nfse);

            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    async salvarMuitos(nfses:Nfse[]): Promise<void> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readwrite');
            const store = transaction.objectStore(this.nfseStore);

            for(const nfse of nfses) {
                store.put(nfse);
            }

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error); 
        });
    }

    async buscar(id: string): Promise<Nfse | undefined> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);

            const request = store.get(id);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async buscarMuitos(ids: string[]): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);
            const encontrados: Nfse[] = [];

            let pendentes = ids.length;
            if (pendentes === 0) {
                resolve([]);
                return;
            }
            for (const id of ids) {
                const request = store.get(id);

                request.onsuccess = () => {
                    if (request.result) {
                        encontrados.push(request.result);
                    }
                    pendentes --;
                    
                    if (pendentes === 0) {
                        resolve(encontrados);
                    }
                }
                request.onerror = () => {
                    reject(request.error);
                }
            }

        });
    }

    async listar(): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);

            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            }
        });
    }

    async buscarPorStatus(status: Nfse['status']): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);
            const index = store.index('status');

            const request = index.getAll(status);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async buscarPorPeriodo(dtInicial?: string, dtFinal?: string): Promise<Nfse[]> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.nfseStore, 'readonly');
            const store = transaction.objectStore(this.nfseStore);
            const index = store.index('dh_emi');
            let range: IDBKeyRange | undefined;
            
            if (dtInicial && dtFinal) {
                const ini = new Date(`${dtInicial}T00:00:00`);
                const fin = new Date(`${dtFinal}T23:59:59`);
                range = IDBKeyRange.bound(ini.toISOString(), fin.toISOString());
            } else if (dtInicial) {
                const ini = new Date(`${dtInicial}T00:00:00`);
                range = IDBKeyRange.lowerBound(ini.toISOString());
            } else if (dtFinal) {
                const fin = new Date(`${dtFinal}T23:59:59`);
                range = IDBKeyRange.upperBound(fin.toISOString());
            }

            const request = index.getAll(range);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async salvarMetadata(chave: string, valor: string): Promise<void> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.metadataStore, 'readwrite');
            const store = transaction.objectStore(this.metadataStore);
            const metadata: NfseMetadata = { chave, valor };

            store.put(metadata);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async buscaMetadata(chave: string): Promise<string | undefined> {
        const db = await this.abrir();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.metadataStore, 'readonly');
            const store = transaction.objectStore(this.metadataStore);

            const request = store.get(chave);

            request.onsuccess = () => {
                const metadata = request.result as NfseMetadata | undefined;
                resolve(metadata?.valor);
            };
            request.onerror = () => {
                reject(request.error);
            }
        });
    }
}
