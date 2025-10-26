'use client'

import { useEffect, useRef } from 'react'

export default function GrapesJSEditor({ initialHtml = '', initialCss = '', initialGjsData = {}, onSave }) {
  const editorRef = useRef(null)
  const editorInstanceRef = useRef(null)

  useEffect(() => {
    // Carregar CSS do GrapesJS
    if (typeof window !== 'undefined' && !document.getElementById('grapesjs-css')) {
      const link1 = document.createElement('link')
      link1.id = 'grapesjs-css'
      link1.rel = 'stylesheet'
      link1.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
      document.head.appendChild(link1)

      const link2 = document.createElement('link')
      link2.rel = 'stylesheet'
      link2.href = 'https://unpkg.com/grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
      document.head.appendChild(link2)
    }

    // Importar GrapesJS apenas no cliente
    if (typeof window !== 'undefined' && editorRef.current && !editorInstanceRef.current) {
      import('grapesjs').then((grapesjs) => {
        import('grapesjs-preset-webpage').then((presetWebpage) => {
          const editor = grapesjs.default.init({
            container: editorRef.current,
            height: '100%',
            width: 'auto',
            storageManager: false,
            plugins: [presetWebpage.default],
            pluginsOpts: {
              [presetWebpage.default]: {}
            },
            canvas: {
              styles: [],
              scripts: []
            },
            panels: {
              defaults: [
                {
                  id: 'basic-actions',
                  el: '.panel__basic-actions',
                  buttons: [
                    {
                      id: 'visibility',
                      active: true,
                      className: 'btn-toggle-borders',
                      label: '<i class="fa fa-clone"></i>',
                      command: 'sw-visibility',
                    }
                  ],
                },
                {
                  id: 'panel-devices',
                  el: '.panel__devices',
                  buttons: [
                    {
                      id: 'device-desktop',
                      label: '<i class="fa fa-desktop"></i>',
                      command: 'set-device-desktop',
                      active: true,
                      togglable: false,
                    },
                    {
                      id: 'device-mobile',
                      label: '<i class="fa fa-mobile"></i>',
                      command: 'set-device-mobile',
                      togglable: false,
                    }
                  ],
                },
              ],
            },
            deviceManager: {
              devices: [
                {
                  name: 'Desktop',
                  width: '',
                },
                {
                  name: 'Mobile',
                  width: '320px',
                  widthMedia: '480px',
                }
              ]
            },
            blockManager: {
              appendTo: '.blocks-container',
              blocks: [
                {
                  id: 'section',
                  label: '<div>Seção</div>',
                  attributes: { class: 'gjs-block-section' },
                  content: '<section style="padding: 40px 20px; min-height: 200px;"><div class="container"></div></section>'
                },
                {
                  id: 'text',
                  label: 'Texto',
                  content: '<div style="padding: 10px;">Insira seu texto aqui</div>'
                },
                {
                  id: 'image',
                  label: 'Imagem',
                  select: true,
                  content: { type: 'image' },
                  activate: true
                },
                {
                  id: 'video',
                  label: 'Vídeo',
                  content: {
                    type: 'video',
                    src: 'https://www.youtube.com/embed/jNQXAC9IVRw',
                    style: { height: '350px', width: '100%' }
                  }
                },
                {
                  id: 'button',
                  label: 'Botão',
                  content: '<a href="#" style="display: inline-block; padding: 12px 24px; background-color: #E9498B; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Clique Aqui</a>'
                },
                {
                  id: 'spacer',
                  label: 'Espaçador',
                  content: '<div style="height: 50px;"></div>'
                },
                {
                  id: 'html',
                  label: 'HTML',
                  content: '<div>Código HTML customizado</div>',
                  attributes: { class: 'fa fa-code' }
                }
              ]
            },
            layerManager: {
              appendTo: '.layers-container'
            },
            selectorManager: {
              appendTo: '.styles-container'
            },
            styleManager: {
              appendTo: '.styles-container',
              sectors: [
                {
                  name: 'Dimensões',
                  open: false,
                  buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding']
                },
                {
                  name: 'Tipografia',
                  open: false,
                  buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align']
                },
                {
                  name: 'Decorações',
                  open: false,
                  buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background']
                },
                {
                  name: 'Extra',
                  open: false,
                  buildProps: ['transition', 'perspective', 'transform']
                }
              ]
            },
            traitManager: {
              appendTo: '.traits-container'
            }
          })

          // Carregar conteúdo inicial
          if (initialGjsData && Object.keys(initialGjsData).length > 0) {
            editor.loadProjectData(initialGjsData)
          } else if (initialHtml) {
            editor.setComponents(initialHtml)
            editor.setStyle(initialCss)
          }

          // Salvar referência
          editorInstanceRef.current = editor

          // Listener para salvar
          if (onSave) {
            editor.on('storage:store', () => {
              const html = editor.getHtml()
              const css = editor.getCss()
              const gjsData = editor.getProjectData()
              onSave({ html, css, gjsData })
            })
          }
        })
      })
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [])

  // Função para salvar manualmente
  const handleSave = () => {
    if (editorInstanceRef.current && onSave) {
      const html = editorInstanceRef.current.getHtml()
      const css = editorInstanceRef.current.getCss()
      const gjsData = editorInstanceRef.current.getProjectData()
      onSave({ html, css, gjsData })
    }
  }

  // Expor função de salvar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.saveGrapesJS = handleSave
    }
  }, [])

  return (
    <div className="gjs-editor-wrapper">
      {/* Painel Esquerdo - Blocos */}
      <div className="gjs-left-panel">
        <div className="panel-header">
          <h3>ELEMENTOS</h3>
        </div>
        <div className="blocks-container"></div>
      </div>

      {/* Editor Central */}
      <div className="gjs-main-editor">
        <div className="panel__devices"></div>
        <div className="panel__basic-actions"></div>
        <div id="gjs" ref={editorRef}></div>
      </div>

      {/* Painel Direito - Estilos */}
      <div className="gjs-right-panel">
        <div className="panel-tabs">
          <button className="tab-btn active" onClick={() => {
            document.querySelector('.styles-container').style.display = 'block'
            document.querySelector('.layers-container').style.display = 'none'
            document.querySelector('.traits-container').style.display = 'none'
          }}>Estilos</button>
          <button className="tab-btn" onClick={() => {
            document.querySelector('.styles-container').style.display = 'none'
            document.querySelector('.layers-container').style.display = 'block'
            document.querySelector('.traits-container').style.display = 'none'
          }}>Camadas</button>
          <button className="tab-btn" onClick={() => {
            document.querySelector('.styles-container').style.display = 'none'
            document.querySelector('.layers-container').style.display = 'none'
            document.querySelector('.traits-container').style.display = 'block'
          }}>Atributos</button>
        </div>
        <div className="styles-container"></div>
        <div className="layers-container" style={{ display: 'none' }}></div>
        <div className="traits-container" style={{ display: 'none' }}></div>
      </div>
      
      <style jsx global>{`
        .gjs-editor-wrapper {
          display: flex;
          height: 100%;
          background: #f5f5f5;
        }
        
        /* Painel Esquerdo */
        .gjs-left-panel {
          width: 280px;
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .panel-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          letter-spacing: 0.5px;
        }
        
        .blocks-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        /* Editor Central */
        .gjs-main-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .panel__devices,
        .panel__basic-actions {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 16px;
          display: flex;
          gap: 8px;
        }
        
        #gjs {
          flex: 1;
          border: none;
        }
        
        /* Painel Direito */
        .gjs-right-panel {
          width: 300px;
          background: white;
          border-left: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .panel-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .tab-btn {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        
        .tab-btn.active {
          color: #E9498B;
          border-bottom: 2px solid #E9498B;
          background: white;
        }
        
        .styles-container,
        .layers-container,
        .traits-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        /* Canvas */
        .gjs-cv-canvas {
          background: #f5f5f5;
        }
        
        /* Blocos */
        .gjs-block {
          width: calc(50% - 8px);
          min-height: 80px;
          padding: 12px;
          margin: 4px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .gjs-block:hover {
          border-color: #E9498B;
          background: #fef2f7;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .gjs-block-label {
          font-size: 12px;
          color: #374151;
          margin-top: 8px;
          font-weight: 500;
        }
        
        .gjs-block svg,
        .gjs-block i {
          font-size: 24px;
          color: #E9498B;
        }
        
        /* Botões de dispositivo */
        .gjs-pn-btn {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .gjs-pn-btn:hover {
          background: #f9fafb;
          border-color: #E9498B;
        }
        
        .gjs-pn-btn.gjs-pn-active {
          background: #E9498B;
          color: white;
          border-color: #E9498B;
        }
        
        /* Style Manager */
        .gjs-sm-sector {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 0;
        }
        
        .gjs-sm-sector-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          padding: 8px 0;
        }
        
        .gjs-sm-property {
          margin: 8px 0;
        }
        
        .gjs-sm-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        /* Layers */
        .gjs-layer {
          padding: 8px;
          border-radius: 4px;
          margin: 2px 0;
          cursor: pointer;
        }
        
        .gjs-layer:hover {
          background: #f3f4f6;
        }
        
        .gjs-layer.gjs-selected {
          background: #fef2f7;
          border-left: 3px solid #E9498B;
        }
      `}</style>
    </div>
  )
}

